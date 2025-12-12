import * as fs from 'fs'; 
import { Builder, By, Key, until, WebDriver } from "selenium-webdriver";
import { describe, it, before, after } from "mocha";
import UserAgent from "user-agents";
import { Options as ChromeOptions } from "selenium-webdriver/chrome.js";

describe("Google Search Scraping - Dynamic UA", function () {
  this.timeout(60000);

  let driver: WebDriver;

  before(async function () {
    // 1. Generate a random User-Agent specifically for Firefox on Desktop.
    // We MUST use Firefox UAs because we are using the Firefox Driver.
    // Using a Chrome UA here would trigger immediate detection due to engine mismatch.
    const userAgentGenerator = new UserAgent({
      deviceCategory: "desktop",
    });

    const currentUA = userAgentGenerator.toString();
    console.log(`Using User-Agent: ${currentUA}`);

    // 2. Cấu hình Chrome Options
    const options = new ChromeOptions();

    // --- CẤU HÌNH STEALTH QUAN TRỌNG ---

    // a. Tắt dòng "Chrome is being controlled by automated test software"
    options.excludeSwitches("enable-automation");
    options.setUserPreferences({ useAutomationExtension: false });

    // b. Quan trọng nhất: Tắt flag nhận diện Bot của Blink engine
    // (Tương đương với việc xóa navigator.webdriver = true)
    options.addArguments("--disable-blink-features=AutomationControlled");

    // c. Fake User-Agent
    options.addArguments(`--user-agent=${currentUA}`);

    // d. Kích thước cửa sổ giống người thật
    options.addArguments("--window-size=1920,1080");

    // e. Tùy chọn: Tắt GPU nếu hay bị lỗi crash (tùy máy)
    // options.addArguments("--disable-gpu");

    // 3. Khởi tạo Driver
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
  });

  it("should search Selenium TS on Google with Chrome", async function () {
    await driver.get("https://www.google.com");

    try {
        // Tìm nút "Accept all" hoặc "I agree" (Google thay đổi liên tục nên chỉ thử)
        // Selector này là ví dụ phổ biến cho nút Accept
        const cookieButton = await driver.findElements(By.xpath("//button[div[contains(text(), 'Accept') or contains(text(), 'Đồng ý')]]"));
        if (cookieButton.length > 0 && await cookieButton[0].isDisplayed()) {
            console.log("Phát hiện Popup Cookie, đang tắt...");
            await cookieButton[0].click();
            await driver.sleep(1000);
        }
    } catch (e) { /* Bỏ qua nếu không có lỗi */ }

    const searchBox = await driver.findElement(By.name("q"));
    
    // 2. Thay đổi cách Submit: Dùng submit() thay vì gõ Enter (Ổn định hơn)
    await searchBox.sendKeys("Selenium TS");
    await searchBox.submit(); 

    // 3. Đổi chiến thuật chờ (Wait Strategy)
    // Thay vì chờ 'div.g' ngay, hãy chờ cái container lớn trước
    console.log("Đang chờ kết quả tải...");
    
    try {
        // Chờ id="search" (Container chính của kết quả)
        await driver.wait(until.elementLocated(By.id("search")), 15000); 
        
        // Sau đó mới tìm các link bên trong
        // Selector này lấy tất cả thẻ H3 (Tiêu đề bài viết) -> Lấy cha của nó là thẻ A
        const links = await driver.findElements(By.css("#search a h3"));
        
        if (links.length === 0) {
            throw new Error("Load được khung search nhưng không thấy link nào!");
        }

        console.log(`Tìm thấy ${links.length} kết quả tiềm năng.`);
        
        // In ra 5 kết quả đầu
        for (let i = 0; i < Math.min(5, links.length); i++) {
            // Từ h3, đi ngược lên thẻ a cha
            const parentLink = await links[i].findElement(By.xpath("./..")); 
            console.log(`${i+1}. ${await parentLink.getAttribute("href")}`);
        }

    } catch (e) {
        // --- CHỤP ẢNH MÀN HÌNH KHI LỖI ---
        console.error("LỖI: Không thấy kết quả. Đang chụp ảnh màn hình...");
        const image = await driver.takeScreenshot();
        fs.writeFileSync('error_debug.png', image, 'base64');
        console.log("Đã lưu ảnh lỗi tại: error_debug.png. Hãy mở ra xem!");
        
        // In ra tiêu đề trang hiện tại để xem nó đang ở đâu
        const title = await driver.getTitle();
        console.log(`Tiêu đề trang hiện tại: ${title}`);
        
        throw e;
    }
});

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
});
