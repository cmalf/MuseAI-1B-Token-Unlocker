# 🚀 Muse.ai 1B Token Unlocker

MuseAI Token Unlocker is an automation tool that simplifies claiming 1 Billion free tokens on Muse.ai. By combining `puppeteer-real-browser` with a built-in proxy verification tool, it allows global users to bypass region locks securely and redeem limited-time promo codes.

<br> <img width="185" height="185" alt="mascot" src="https://museai.pk/muse-logo.png" />
---

## 🌍 Important Region & Proxy Details

*   **US Citizens:** No proxy is required. You can access the site and register directly.
*   **Non-US Citizens:** You must use a US-region proxy to bypass geographical restrictions during registration.
*   **Proxy Recommendation:** You can use [Proxies.fo](https://app.proxies.fo/ref/8b1abd0f-c734-1602-5985-612caedf4c7b) or any other reliable proxy provider.
*   **Using the App:** Once you have successfully registered and claimed your 1B tokens, you can download the official Muse application. You **DO NOT** need a VPN or proxy to use the app afterward!
  
### FREE PROXY : [cmalf.github.io/web-tools/proxy-hunter](https://cmalf.github.io/web-tools/proxy-hunter)
---

## 📧 Account Creation Tip

To ensure a smooth registration and easily pass the credit card age verification process, it is highly recommended to use an email address that is **more than one year old**.

---

## 🎁 Exclusive Codes

Use the following exclusive codes to claim your 1B tokens. Each code is **strictly limited to the first 30 users!**

*   🎟️ **`RWQZ9Q`**
*   🎟️ **`H7ZPU7`**

---
## 💡 How to Redeem Your 1B Tokens

1.  Run the script and complete your sign-up on the Muse.ai join page.
2.  Once logged in, navigate to **Settings**.
3.  Select the **Redeem** option.
4.  Enter one of the referral codes above.

---

## 🛠️ Installation

1.  **Clone this repository** to your local environment.
2.  **Install the necessary dependencies** by running:
    ```bash
    npm install
    ```

---

## 🚀 Usage

## 🔎 Proxy Scanner Tool

This repository includes a built-in proxy scanner (`proxy-scanner.js`) to help non-US citizens easily find and verify working US proxies before registering.

**Features:**
* Scans a list of proxies from a `proxy.txt` file.
* Verifies proxy connectivity and checks its geographical region via `ipinfo.io`.
* Automatically filters and saves only active **US region proxies** to a new file named `US_proxy.txt`.

**How to use the Proxy Scanner:**

1. Create a file named `proxy.txt` in the root directory.
2. Paste your raw proxy list into `proxy.txt` (one proxy per line, e.g., `http://user:pass@host:port` or `socks5://host:port`).
3. Run the scanner using the following command:
   ```bash
   npm run scan
   ```
4. Check the console for live results. Once finished, open `US_proxy.txt` to find your working US proxies.

1.  **Run the main script** using the command:
    ```bash
    npm start
    ```
2.  **Enter your Proxy URL** when prompted (e.g., `http://username:password@host:port`). If you are a US citizen, you can bypass this if you run the browser normally without proxy configurations.
3.  The script will automatically parse your proxy setup, launch a secure browser, and navigate to the Muse.ai Join page.
4.  **Follow the manual redemption steps** above to claim your tokens!

---

## ⚠️ Disclaimer

This script is provided for educational and accessibility purposes. Please ensure your use of proxies and referral codes complies with Muse.ai's Terms of Service.
