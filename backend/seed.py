import random
import string
import psycopg2
from faker import Faker
from datetime import datetime, timedelta, date
from decimal import Decimal

# ---------- CONFIG ----------
DB_CONFIG = {
    "dbname": "crdb",
    "user": "admin",
    "password": "admin",
    "host": "localhost",
}

SEED = 12345
F = Faker()
F.seed_instance(SEED)
random.seed(SEED)

# Sizes (tweak if you want larger/smaller datasets)
N_USERS = 300
N_AIRPORTS = 25
N_AIRPLANES = 8
FLIGHTS_PER_DAY = 12   # average flights created (multiplied by days_range)
DAYS_RANGE = 30        # creating flights across next X days
N_SERVICES = 120
N_PLACES = 80
N_EXPLORES_PER_USER = 2
AVG_PASSENGERS_PER_BOOKING = 2.5  # average passengers per booking

# ---------- HELPERS ----------
def exec_sql(cur, sql, params=None):
    cur.execute(sql, params) if params else cur.execute(sql)

def bulk_insert(cur, sql, data):
    cur.executemany(sql, data)

def generate_booking_reference():
    """Generate a unique booking reference like ABC123XYZ"""
    letters = ''.join(random.choices(string.ascii_uppercase, k=3))
    numbers = ''.join(random.choices(string.digits, k=3))
    letters2 = ''.join(random.choices(string.ascii_uppercase, k=3))
    return f"{letters}{numbers}{letters2}"

# ---------- MAIN ----------
def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        print("1) Truncating public tables (restart identities)...")
        # Truncate all tables in public schema - careful: only use in dev
        cur.execute("""
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
            END LOOP;
        END $$;
        """)
        conn.commit()

        # ---------- USERS ----------
        print("2) Seeding users...")
        users = []
        for _ in range(N_USERS):
            uid = F.uuid4()
            users.append((str(uid),))
        user_ids = [u[0] for u in users]
        conn.commit()

        # ---------- AIRPORTS ----------
        print("3) Seeding airports...")
        airports = []
        codes = set()
        # Create plausible unique IATA codes
        for _ in range(N_AIRPORTS):
            code = None
            while not code or code in codes:
                code = F.bothify(text='???').upper()
            codes.add(code)
            name = f"{F.city()} Intl Airport"
            city = F.city()
            country = F.country()
            airports.append((code, name, city, country))
        bulk_insert(cur, "INSERT INTO airports (iata_code, name, city, country) VALUES (%s,%s,%s,%s)", airports)
        conn.commit()
        cur.execute("SELECT airport_id FROM airports ORDER BY airport_id")
        airport_ids = [r[0] for r in cur.fetchall()]

        # ---------- AIRPLANES ----------
        print("4) Seeding airplanes...")
        airplanes = []
        for _ in range(N_AIRPLANES):
            model = random.choice(["A320", "A321", "A330", "B737", "B747", "B777", "B787"]) + "-" + str(random.randint(100,900))
            manuf = random.choice(["Airbus","Boeing","COMAC","Embraer"])
            capacity = random.randint(120, 300)
            airplanes.append((model, manuf, capacity))
        bulk_insert(cur, "INSERT INTO airplanes (model, manufacturer, seat_capacity) VALUES (%s,%s,%s)", airplanes)
        conn.commit()
        cur.execute("SELECT airplane_id, seat_capacity FROM airplanes ORDER BY airplane_id")
        airplane_rows = cur.fetchall()
        airplane_ids = [r[0] for r in airplane_rows]
        airplane_capacities = {r[0]: r[1] for r in airplane_rows}

        # ---------- SEATS ----------
        print("5) Seeding seats for each airplane...")
        seats = []
        for a_id in airplane_ids:
            cap = airplane_capacities[a_id]
            # layout: rows of 6 seats (A-F)
            rows = (cap // 6) + (1 if cap % 6 else 0)
            seat_counter = 0
            for row in range(1, rows + 1):
                for seat_letter_index in range(6):
                    seat_counter += 1
                    if seat_counter > cap:
                        break
                    seat_number = f"{row}{chr(65 + seat_letter_index)}"
                    seat_class = random.choices(['economy','business','first'], weights=[0.8,0.15,0.05])[0]
                    seats.append((a_id, seat_number, seat_class))
        bulk_insert(cur, "INSERT INTO seats (airplane_id, seat_number, seat_class) VALUES (%s,%s,%s)", seats)
        conn.commit()
        cur.execute("SELECT seat_id, airplane_id FROM seats ORDER BY seat_id")
        seat_rows = cur.fetchall()
        seat_by_airplane = {}
        for seat_id, a_id in seat_rows:
            seat_by_airplane.setdefault(a_id, []).append(seat_id)

        # ---------- FLIGHTS ----------
        print("6) Seeding flights...")
        flights = []
        tomorrow = datetime.now().replace(hour=6, minute=0, second=0, microsecond=0) + timedelta(days=1)
        num_flights = FLIGHTS_PER_DAY * DAYS_RANGE
        for i in range(num_flights):
            origin, dest = random.sample(airport_ids, 2)
            # departure spread across next DAYS_RANGE days (starting from tomorrow)
            depart = tomorrow + timedelta(days=random.randint(0, DAYS_RANGE-1), hours=random.randint(0, 18), minutes=random.choice([0,15,30,45]))
            duration_hours = random.randint(1, 12)
            arrive = depart + timedelta(hours=duration_hours, minutes=random.randint(0,59))
            airplane_id = random.choice(airplane_ids)
            flight_number = f"VN{random.randint(100,9999)}"
            status = random.choices(['scheduled','delayed','cancelled','completed'], weights=[0.7,0.15,0.05,0.1])[0]
            base_price = Decimal(random.randint(50, 800)) + Decimal(random.choice([0, .99]))
            tax_rate = Decimal("0.15")
            flights.append((flight_number, airplane_id, origin, dest, depart, arrive, status, base_price, tax_rate))
        bulk_insert(cur, """
            INSERT INTO flights (flight_number, airplane_id, origin_airport_id, destination_airport_id,
                                 departure_time, arrival_time, status, base_price, tax_rate)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, flights)
        conn.commit()
        cur.execute("SELECT flight_id, airplane_id FROM flights ORDER BY flight_id")
        flight_rows = cur.fetchall()
        flight_ids = [r[0] for r in flight_rows]

        # ---------- FLIGHT_SEATS ----------
        print("7) Seeding flight_seats (many rows) ...")
        # We'll only create flight_seats for flights with their airplane's seats
        flight_seats_data = []
        for flight_id, airplane_id in flight_rows:
            seat_list = seat_by_airplane.get(airplane_id, [])
            for seat_id in seat_list:
                status = random.choices(['available','reserved','booked'], weights=[0.7,0.15,0.15])[0]
                price_multiplier = round(random.uniform(0.8, 2.5), 2)
                flight_seats_data.append((flight_id, seat_id, status, Decimal(price_multiplier)))
            # Batch per flight to avoid huge single executemany; commit per 20 flights
            if len(flight_seats_data) > 2000:
                bulk_insert(cur, """
                    INSERT INTO flight_seats (flight_id, seat_id, status, price_multiplier)
                    VALUES (%s,%s,%s,%s)
                """, flight_seats_data)
                conn.commit()
                flight_seats_data = []
        if flight_seats_data:
            bulk_insert(cur, """
                INSERT INTO flight_seats (flight_id, seat_id, status, price_multiplier)
                VALUES (%s,%s,%s,%s)
            """, flight_seats_data)
            conn.commit()

        # ---------- BOOKINGS, PASSENGERS, EMERGENCY CONTACTS & PAYMENTS ----------
        print("8) Seeding bookings, passengers, emergency contacts, and payments...")
        
        # Get available flight seats
        cur.execute("SELECT flight_seat_id, flight_id, price_multiplier FROM flight_seats WHERE status = 'available'")
        available_seats = cur.fetchall()
        
        # Create ~300-500 bookings with multiple passengers
        n_bookings = min(200, len(available_seats) // 3)
        bookings_data = []
        booking_references = set()
        
        for _ in range(n_bookings):
            user_id = random.choice(user_ids)
            status = random.choices(['confirmed','pending','cancelled'], weights=[0.75,0.15,0.1])[0]
            booking_date = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 48))
            
            # Generate unique booking reference
            booking_ref = generate_booking_reference()
            while booking_ref in booking_references:
                booking_ref = generate_booking_reference()
            booking_references.add(booking_ref)
            
            notes = F.text(max_nb_chars=100) if random.random() < 0.3 else None
            
            # We'll calculate total_amount later after creating passengers
            bookings_data.append((user_id, booking_ref, booking_date, status, None, notes))
        
        if bookings_data:
            bulk_insert(cur, """
                INSERT INTO bookings (user_id, booking_reference, booking_date, status, total_amount, notes)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, bookings_data)
            conn.commit()
            
            # Fetch created bookings
            cur.execute("SELECT booking_id, user_id, status, booking_reference FROM bookings ORDER BY booking_id")
            all_bookings = cur.fetchall()
            
            # Create passengers for each booking
            passengers_data = []
            seat_index = 0
            
            for booking_id, user_id, b_status, b_ref in all_bookings:
                # Number of passengers per booking (1-4, weighted towards 1-2)
                n_passengers = random.choices([1,2,3,4], weights=[0.35, 0.40, 0.15, 0.10])[0]
                
                for p_idx in range(n_passengers):
                    # Determine passenger type
                    if p_idx == 0:
                        passenger_type = 'adult'  # First passenger is always adult
                    else:
                        passenger_type = random.choices(
                            ['adult', 'child', 'infant'],
                            weights=[0.6, 0.3, 0.1]
                        )[0]
                    
                    # Personal info
                    first_name = F.first_name()
                    middle_name = F.first_name() if random.random() < 0.3 else None
                    last_name = F.last_name()
                    suffix = random.choice(['Jr.', 'Sr.', 'III', None, None, None])
                    
                    # Date of birth based on type
                    if passenger_type == 'adult':
                        dob = F.date_of_birth(minimum_age=18, maximum_age=85)
                    elif passenger_type == 'child':
                        dob = F.date_of_birth(minimum_age=2, maximum_age=17)
                    else:  # infant
                        dob = F.date_of_birth(minimum_age=0, maximum_age=1)
                    
                    # Contact info (mainly for lead passenger)
                    email = F.email() if p_idx == 0 else (F.email() if random.random() < 0.2 else None)
                    # Generate simple phone number (max 20 chars for VARCHAR(20))
                    phone = f"+1{random.randint(2000000000,9999999999)}" if p_idx == 0 else (f"+1{random.randint(2000000000,9999999999)}" if random.random() < 0.1 else None)
                    
                    # Travel documents (respecting VARCHAR limits)
                    redress = f"RN{random.randint(100000,999999)}" if random.random() < 0.1 else None  # max 9 chars
                    known_traveler = f"KTN{random.randint(10000000,99999999)}" if random.random() < 0.15 else None  # max 11 chars
                    
                    # Assign seat if available and not cancelled
                    flight_seat_id = None
                    if b_status != 'cancelled' and seat_index < len(available_seats):
                        flight_seat_id = available_seats[seat_index][0]
                        seat_index += 1
                    
                    # Special requests
                    special_requests = random.choice([
                        'Wheelchair assistance', 
                        'Vegetarian meal',
                        'Window seat preferred',
                        'Extra legroom',
                        None, None, None, None
                    ])
                    
                    passengers_data.append((
                        booking_id, passenger_type, first_name, middle_name, last_name,
                        suffix, dob, email, phone, redress, known_traveler,
                        flight_seat_id, special_requests
                    ))
            
            if passengers_data:
                bulk_insert(cur, """
                    INSERT INTO passengers (
                        booking_id, passenger_type, first_name, middle_name, last_name,
                        suffix, date_of_birth, email, phone_number, redress_number,
                        known_traveler_number, flight_seat_id, special_requests
                    ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, passengers_data)
                conn.commit()
                
                # Update flight_seats status to 'booked' for assigned seats
                if seat_index > 0:
                    booked_seat_ids = [available_seats[i][0] for i in range(seat_index)]
                    for seat_id in booked_seat_ids:
                        cur.execute("UPDATE flight_seats SET status = 'booked' WHERE flight_seat_id = %s", (seat_id,))
                    conn.commit()
            
            # Create emergency contacts for passengers
            print("   - Creating emergency contacts...")
            cur.execute("SELECT passenger_id, first_name, last_name FROM passengers")
            all_passengers = cur.fetchall()
            
            emergency_contacts_data = []
            for passenger_id, p_first, p_last in all_passengers:
                # ~60% of passengers have emergency contact
                if random.random() < 0.6:
                    ec_first = F.first_name()
                    ec_last = p_last if random.random() < 0.7 else F.last_name()  # often same last name
                    ec_email = F.email() if random.random() < 0.7 else None
                    # Generate simple phone number (max 20 chars for VARCHAR(20))
                    ec_phone = f"+1{random.randint(2000000000,9999999999)}"
                    relationship = random.choice(['spouse', 'parent', 'sibling', 'friend', 'partner', 'child'])
                    
                    emergency_contacts_data.append((
                        passenger_id, ec_first, ec_last, ec_email, ec_phone, relationship
                    ))
            
            if emergency_contacts_data:
                bulk_insert(cur, """
                    INSERT INTO emergency_contacts (
                        passenger_id, first_name, last_name, email, phone_number, relationship_type
                    ) VALUES (%s,%s,%s,%s,%s,%s)
                """, emergency_contacts_data)
                conn.commit()
            
            # Calculate total_amount for each booking and create payments
            print("   - Calculating booking totals and creating payments...")
            payments_data = []
            
            for booking_id, user_id, b_status, b_ref in all_bookings:
                # Get passengers and their seats for this booking
                cur.execute("""
                    SELECT p.passenger_id, p.flight_seat_id, p.passenger_type
                    FROM passengers p
                    WHERE p.booking_id = %s
                """, (booking_id,))
                booking_passengers = cur.fetchall()
                
                total_amount = Decimal(0)
                
                for p_id, fs_id, p_type in booking_passengers:
                    if fs_id:
                        # Get flight price info
                        cur.execute("""
                            SELECT f.base_price, f.tax_rate, fs.price_multiplier
                            FROM flight_seats fs
                            JOIN flights f ON fs.flight_id = f.flight_id
                            WHERE fs.flight_seat_id = %s
                        """, (fs_id,))
                        price_info = cur.fetchone()
                        
                        if price_info:
                            base_price, tax_rate, multiplier = price_info
                            # Infants typically pay less or free
                            passenger_multiplier = 0.1 if p_type == 'infant' else (0.75 if p_type == 'child' else 1.0)
                            
                            seat_price = Decimal(base_price) * Decimal(multiplier) * Decimal(passenger_multiplier)
                            tax = seat_price * Decimal(tax_rate)
                            total_amount += (seat_price + tax).quantize(Decimal("0.01"))
                
                # Update booking total_amount
                if total_amount > 0:
                    cur.execute("""
                        UPDATE bookings SET total_amount = %s WHERE booking_id = %s
                    """, (total_amount, booking_id))
                    
                    # Create payment for non-cancelled bookings
                    if b_status != 'cancelled':
                        method = random.choice(['credit_card', 'credit_card', 'credit_card', 'paypal', 'bank_transfer'])
                        pay_status = random.choices(['success','failed','pending'], weights=[0.88,0.04,0.08])[0]
                        pay_date = datetime.now() - timedelta(days=random.randint(0, 25))
                        payments_data.append((booking_id, total_amount, pay_date, method, pay_status))
            
            conn.commit()
            
            if payments_data:
                bulk_insert(cur, """
                    INSERT INTO payments (booking_id, amount, payment_date, method, status)
                    VALUES (%s,%s,%s,%s,%s)
                """, payments_data)
                conn.commit()

        # ---------- PLACES ----------
        print("9) Seeding places...")
        places = []
        for _ in range(N_PLACES):
            name = F.city() + " " + random.choice(["Sightseeing","Park","Museum","Beach","Center"])
            country = F.country()
            city = F.city()
            description = F.text(max_nb_chars=200)
            places.append((name, country, city, description))
        bulk_insert(cur, "INSERT INTO places (name,country,city,description) VALUES (%s,%s,%s,%s)", places)
        conn.commit()
        cur.execute("SELECT place_id FROM places ORDER BY place_id")
        place_ids = [r[0] for r in cur.fetchall()]

        # ---------- SERVICES, HOTELS, CAR_RENTALS ----------
        print("10) Seeding services, hotels, car_rentals...")
        services = []
        types = ['hotel','rental_car','package']
        for i in range(N_SERVICES):
            stype = random.choices(types, weights=[0.5, 0.35, 0.15])[0]
            name = f"{random.choice(['Holiday','City','Premium','Budget','Comfort'])} {random.choice(['Stay','Cars','Package'])} {i}"
            price = Decimal(random.randint(20, 1000))
            services.append((name, stype, price))
        bulk_insert(cur, "INSERT INTO services (name, type, price) VALUES (%s,%s,%s)", services)
        conn.commit()
        # get services and assign to hotels/car_rentals/packages
        cur.execute("SELECT service_id, type FROM services ORDER BY service_id")
        service_rows = cur.fetchall()
        hotel_entries = []
        car_entries = []
        package_entries = []
        for sid, st in service_rows:
            if st == 'hotel':
                location = F.address()
                stars = random.randint(1,5)
                desc = F.text(max_nb_chars=200)
                hotel_entries.append((sid, location, stars, desc))
            elif st == 'rental_car':
                car_model = random.choice(['Camry','Civic','Corolla','Model S','CX-5'])
                brand = random.choice(['Toyota','Honda','Mazda','Tesla','Ford'])
                daily_rate = Decimal(random.randint(20,200))
                available = random.choice([True]*9 + [False])
                car_entries.append((sid, car_model, brand, daily_rate, available))
            elif st == 'package':
                # create a booking_packages entry later once hotels/car_rentals exist
                name = f"Package {sid}"
                total_price = Decimal(random.randint(200, 4000))
                package_entries.append((sid, None, None, name, total_price))
        if hotel_entries:
            bulk_insert(cur, "INSERT INTO hotels (service_id, location, stars, description) VALUES (%s,%s,%s,%s)", hotel_entries)
        if car_entries:
            bulk_insert(cur, "INSERT INTO car_rentals (service_id, car_model, brand, daily_rate, available) VALUES (%s,%s,%s,%s,%s)", car_entries)
        if package_entries:
            # For packages, try to attach random hotel_id and car_rental_id if exist
            # Fetch some created hotel_ids and car_rental_ids
            cur.execute("SELECT hotel_id, service_id FROM hotels")
            hotel_map = cur.fetchall()
            cur.execute("SELECT car_rental_id, service_id FROM car_rentals")
            car_map = cur.fetchall()
            # convert to dicts
            hotel_by_service = {s: hid for hid, s in hotel_map}
            car_by_service = {s: cid for cid, s in car_map}
            package_rows_to_insert = []
            for sid, _, _, name, total_price in package_entries:
                # pick random hotel and car if available
                hotel_id = random.choice(list(hotel_by_service.values())) if hotel_by_service else None
                car_id = random.choice(list(car_by_service.values())) if car_by_service else None
                package_rows_to_insert.append((sid, hotel_id, car_id, name, total_price))
            if package_rows_to_insert:
                bulk_insert(cur, "INSERT INTO booking_packages (service_id, hotel_id, car_rental_id, name, total_price) VALUES (%s,%s,%s,%s,%s)", package_rows_to_insert)
        conn.commit()

        # ---------- BOOKING_SERVICES ----------
        print("11) Seeding booking_services (some bookings have add-on services)...")
        # pick some bookings and attach services
        cur.execute("SELECT booking_id FROM bookings")
        all_booking_ids = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT service_id FROM services")
        all_service_ids = [r[0] for r in cur.fetchall()]
        booking_service_rows = []
        for b in random.sample(all_booking_ids, k=min(len(all_booking_ids), int(len(all_booking_ids) * 0.4) or 1)):
            # each booking may have 0-3 services
            for _ in range(random.randint(0, 2)):
                sid = random.choice(all_service_ids)
                qty = random.randint(1,3)
                booking_service_rows.append((b, sid, qty))
        if booking_service_rows:
            bulk_insert(cur, "INSERT INTO booking_services (booking_id, service_id, quantity) VALUES (%s,%s,%s)", booking_service_rows)
        conn.commit()

        # ---------- PACKAGE PLACES ----------
        print("12) Seeding package_places (connect packages to places) ...")
        cur.execute("SELECT package_id FROM booking_packages")
        package_ids = [r[0] for r in cur.fetchall()]
        package_place_rows = []
        for pkg in package_ids:
            days = random.randint(1,5)
            sample_places = random.sample(place_ids, k=min(len(place_ids), days))
            for idx, pid in enumerate(sample_places, start=1):
                package_place_rows.append((pkg, pid, idx))
        if package_place_rows:
            bulk_insert(cur, "INSERT INTO package_places (package_id, place_id, day_number) VALUES (%s,%s,%s)", package_place_rows)
        conn.commit()

        # ---------- TRIP PLANS & ITEMS ----------
        print("13) Seeding trip_plans and trip_plan_items...")
        trip_plans_rows = []
        for _ in range(int(N_USERS * 0.25)):
            user = random.choice(user_ids)
            name = f"{random.choice(['Holiday','Business','Weekend','Adventure'])} {F.city()}"
            start = datetime.now().date() + timedelta(days=random.randint(1,30))
            end = start + timedelta(days=random.randint(1,10))
            notes = F.text(max_nb_chars=100)
            trip_plans_rows.append((user, name, start, end, notes))
        if trip_plans_rows:
            bulk_insert(cur, "INSERT INTO trip_plans (user_id, name, start_date, end_date, notes) VALUES (%s,%s,%s,%s,%s)", trip_plans_rows)
        conn.commit()

        # trip_plan_items: mix flights/services/places
        cur.execute("SELECT plan_id FROM trip_plans")
        plan_ids = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT flight_id FROM flights")
        existing_flights = [r[0] for r in cur.fetchall()]
        cur.execute("SELECT service_id FROM services")
        existing_services = [r[0] for r in cur.fetchall()]
        tpi_rows = []
        for pid in plan_ids:
            items_count = random.randint(1,6)
            for _ in range(items_count):
                f_or_s = random.choice(['flight','service','place'])
                flight_id = random.choice(existing_flights) if f_or_s == 'flight' and existing_flights else None
                service_id = random.choice(existing_services) if f_or_s == 'service' and existing_services else None
                place_id = random.choice(place_ids) if f_or_s == 'place' and place_ids else None
                scheduled_time = datetime.now() + timedelta(days=random.randint(1,30), hours=random.randint(0,23))
                tpi_rows.append((pid, flight_id, service_id, place_id, scheduled_time))
        if tpi_rows:
            bulk_insert(cur, "INSERT INTO trip_plan_items (plan_id, flight_id, service_id, place_id, scheduled_time) VALUES (%s,%s,%s,%s,%s)", tpi_rows)
        conn.commit()

        # ---------- EXPLORES ----------
        print("14) Seeding explores (user posts) ...")
        explores_rows = []
        for u in user_ids:
            for _ in range(random.randint(0, N_EXPLORES_PER_USER)):
                place = random.choice(place_ids)
                title = f"{random.choice(['My trip to','Exploring','Review:'])} {F.city()}"
                content = F.paragraph(nb_sentences=5)
                explores_rows.append((u, place, title, content, datetime.now()))
        if explores_rows:
            bulk_insert(cur, "INSERT INTO explores (user_id, place_id, title, content, created_at) VALUES (%s,%s,%s,%s,%s)", explores_rows)
        conn.commit()

        # ---------- REVENUE FORECASTS ----------
        print("15) Seeding revenue_forecasts (past + predicted) ...")
        rf_rows = []
        days_back = 365
        base_monthly = 50000
        # create historical trending revenue + some noise
        for d in range(days_back):
            date = (datetime.now().date() - timedelta(days=d))
            # simple seasonality: weekly pattern + noise
            weekly = 1.0 + 0.1 * (1 if date.weekday() in (4,5) else 0)  # weekend bump
            trend = 1.0 + (d / days_back) * 0.05
            noise = random.uniform(-0.15, 0.2)
            predicted_revenue = Decimal(max(1000, int(base_monthly * weekly * trend * (1 + noise))))
            model_used = random.choice(['ARIMA','Prophet','XGBoost','Baseline'])
            rf_rows.append((date, predicted_revenue, model_used, datetime.now()))
        # Also create some future forecasts for next 30 days
        for d in range(1,31):
            date = (datetime.now().date() + timedelta(days=d))
            predicted_revenue = Decimal(random.randint(20000,120000))
            rf_rows.append((date, predicted_revenue, 'XGBoost', datetime.now()))
        bulk_insert(cur, "INSERT INTO revenue_forecasts (forecast_date, predicted_revenue, model_used, created_at) VALUES (%s,%s,%s,%s)", rf_rows)
        conn.commit()

        print("✅ Seeding completed successfully.")
    except Exception as e:
        conn.rollback()
        print("❌ Error during seeding:", e)
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()
