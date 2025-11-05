"""
Factory Pattern Demo Script
Run this to see the factory pattern in action.
"""

import sys
sys.path.append('/home/superkid/workspace/cloudrush/backend')

from app.core.database import SessionLocal
from app.factories import get_service_factory, initialize_factories


def demo_hotel_creation():
    """Demonstrate hotel creation using factory pattern."""
    print("\n" + "="*60)
    print("DEMO 1: Creating a Hotel with Factory Pattern")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Initialize factories
        initialize_factories()
        
        # Get hotel factory
        factory = get_service_factory("hotel")
        print(f"\n✅ Retrieved factory: {factory.__class__.__name__}")
        print(f"   Service type: {factory.get_service_type()}")
        
        # Create hotel
        print("\n📝 Creating hotel...")
        service, hotel = factory.create_service_with_details(
            db=db,
            service_data={
                "name": "Factory Demo Hotel",
                "price": 199.99
            },
            details_data={
                "location": "San Francisco, CA",
                "stars": 4,
                "description": "Created using Factory Pattern"
            }
        )
        db.commit()
        
        print(f"\n✅ Successfully created:")
        print(f"   Service ID: {service.service_id}")
        print(f"   Service Name: {service.name}")
        print(f"   Service Type: {service.type}")
        print(f"   Service Price: ${service.price}")
        print(f"   Hotel ID: {hotel.hotel_id}")
        print(f"   Hotel Location: {hotel.location}")
        print(f"   Hotel Stars: {hotel.stars}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        db.close()


def demo_car_rental_creation():
    """Demonstrate car rental creation using factory pattern."""
    print("\n" + "="*60)
    print("DEMO 2: Creating a Car Rental with Factory Pattern")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Get car rental factory
        factory = get_service_factory("rental_car")
        print(f"\n✅ Retrieved factory: {factory.__class__.__name__}")
        print(f"   Service type: {factory.get_service_type()}")
        
        # Create car rental
        print("\n📝 Creating car rental...")
        service, car = factory.create_service_with_details(
            db=db,
            service_data={
                "name": "Factory Demo Car",
                "price": 89.99
            },
            details_data={
                "car_model": "Tesla Model 3",
                "brand": "Tesla",
                "daily_rate": 89.99,
                "available": True
            }
        )
        db.commit()
        
        print(f"\n✅ Successfully created:")
        print(f"   Service ID: {service.service_id}")
        print(f"   Service Name: {service.name}")
        print(f"   Car Rental ID: {car.car_rental_id}")
        print(f"   Car Model: {car.car_model}")
        print(f"   Brand: {car.brand}")
        print(f"   Daily Rate: ${car.daily_rate}")
        print(f"   Available: {car.available}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        db.close()


def demo_package_creation():
    """Demonstrate package creation using factory pattern."""
    print("\n" + "="*60)
    print("DEMO 3: Creating a Package with Factory Pattern")
    print("="*60)
    
    db = SessionLocal()
    try:
        # Get package factory
        factory = get_service_factory("package")
        print(f"\n✅ Retrieved factory: {factory.__class__.__name__}")
        print(f"   Service type: {factory.get_service_type()}")
        
        # Create package
        print("\n📝 Creating package...")
        service, package = factory.create_service_with_details(
            db=db,
            service_data={
                "name": "Factory Demo Package Service",
                "price": 399.99
            },
            details_data={
                "name": "Weekend Getaway Package",
                "total_price": 449.99,
                "hotel_id": None,
                "car_rental_id": None
            }
        )
        db.commit()
        
        print(f"\n✅ Successfully created:")
        print(f"   Service ID: {service.service_id}")
        print(f"   Service Name: {service.name}")
        print(f"   Package ID: {package.package_id}")
        print(f"   Package Name: {package.name}")
        print(f"   Total Price: ${package.total_price}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        db.close()


def demo_factory_registry():
    """Demonstrate factory registry functionality."""
    print("\n" + "="*60)
    print("DEMO 4: Factory Registry")
    print("="*60)
    
    from app.factories.service_factory import ServiceFactoryRegistry
    
    print("\n📋 Available Service Types:")
    for service_type in ServiceFactoryRegistry.get_available_types():
        factory = get_service_factory(service_type)
        print(f"   • {service_type:15} → {factory.__class__.__name__}")
    
    print("\n✨ Factory Pattern Benefits:")
    print("   ✅ Centralized object creation")
    print("   ✅ Easy to extend with new service types")
    print("   ✅ Consistent interface across all services")
    print("   ✅ Improved testability and maintainability")
    print("   ✅ Follows SOLID principles")


def main():
    """Run all demonstrations."""
    print("\n" + "="*60)
    print("🏭 FACTORY PATTERN DEMONSTRATION")
    print("="*60)
    print("\nThis script demonstrates the Factory Pattern implementation")
    print("for creating different types of services in CloudRush backend.")
    
    try:
        demo_hotel_creation()
        demo_car_rental_creation()
        demo_package_creation()
        demo_factory_registry()
        
        print("\n" + "="*60)
        print("✅ All demonstrations completed successfully!")
        print("="*60)
        print("\n📚 For more information, see: FACTORY_PATTERN_GUIDE.md")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
