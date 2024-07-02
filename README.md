# Pintree

[English](README.md) | [中文](README.zh.md)

Pintree is an open-source project aimed at exporting browser bookmarks into a navigation website. With a few simple steps, you can convert your bookmarks into a beautiful and easy-to-use navigation page.

## Project Features and Goals

- Export browser bookmarks
- Convert bookmark files to JSON format
- Generate a static navigation website

#### If you are interested in this project, you can scan the QR code to join the group, or add my WeChat: ```Gift_wei```, and I will invite you to the development group.
![](https://github.com/Pintree-io/pintree/blob/main/assets/wechat_group.png)

This project is not officially released yet but is available for testing. Here is a simple tutorial; follow the steps below to get started.

## Installation and Usage

### Step 1: Fork the Project

Click the `Fork` button at the top right of this page to fork the project to your GitHub account.

### Step 2: Download Browser Bookmarks

1. Open Chrome browser.
2. Type `chrome://bookmarks/` in the address bar and press Enter.
3. Click the three-dot menu at the top right of the page and select `Export bookmarks`.
4. Save the bookmark file to your computer.

### Step 3: Convert Bookmark File

1. Open your browser and visit [Pintree JSON Converter](https://pintree.io/json-converter).
2. Click the `Choose file` button and select the bookmark file you just saved (in HTML format).
3. Click the `Convert` button, and the website will automatically convert the bookmark file to JSON format.
4. Once the conversion is complete, click `Download JSON file` to download the converted file to your computer.

### Step 4: Replace JSON File

1. Open the `pintree` repository in your GitHub account (the project you just forked).
2. Click the `json` folder in the repository.
3. Click the `Upload files` button, select the JSON file you just downloaded, and upload it.
4. Make sure to name the uploaded file `pintree.json` and select `Commit changes`.

### Step 5: Enable GitHub Pages

1. In your `pintree` repository page, click `Settings`.
2. Find the `Pages` option.
3. In the `Source` dropdown menu, select the `gh-pages` branch, then click `Save`.
4. After a few minutes, your static website will be available at `https://yourusername.github.io/pintree`. Remember to replace `yourusername`.

---

By following the steps above, you have successfully completed the installation and setup of the Pintree project. If you encounter any issues, join the group for more help.

## Technologies Used

- HTML/CSS/JavaScript
- JSON processing
- Static site hosting

## Contribution Guide

We welcome contributions and suggestions! Please follow these steps to participate in the project:

1. Fork this repository: https://github.com/Pintree-io/pintree/tree/main
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Submit a Pull Request

Please note that the `main` branch is for source code, while the `gh-pages` branch is for the static website code. Develop and commit to the `main` branch, and we will handle packaging and publishing to the `gh-pages` branch.

## Contact Information

For any questions or suggestions, please contact us through:
- Project website: [Pintree](https://pintree.io/)
- Email: viggo.zw@gmail.com
- WeChat: ```Gift_wei```

Thank you for using and supporting Pintree!