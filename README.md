# Pintree

[English](README.md) | [中文](README.zh.md)

Pintree is an open-source project that aims to convert browser bookmarks into a navigation website. With just a few simple steps, you can transform your bookmarks into a beautiful and user-friendly navigation page.

![](https://github.com/Pintree-io/pintree/blob/main/assets/preview.png)

## Features and Goals

- Export browser bookmarks
- Convert bookmark files to JSON format
- Generate a static navigation website

## Installation and Running

### Step 1: Download Browser Bookmarks

1. Install the [Pintree Bookmarks Exporter](https://chromewebstore.google.com/detail/pintree-bookmarks-exporte/mjcglnkikjidokobpfdcdmcnfdicojce) extension.
2. Use the extension to export browser bookmarks and save the JSON file locally.

![](https://github.com/Pintree-io/pintree/blob/main/assets/guide/step1.png)

### Step 2: Fork the Project

1. Visit the [Pintree GitHub repository](https://github.com/Pintree-io/pintree).
2. Click the `Fork` button in the upper right corner of the page to fork the project to your GitHub account.

![](https://github.com/Pintree-io/pintree/blob/main/assets/guide/step2.png)

### Step 3: Replace the JSON File

1. Open the `pintree` repository in your GitHub account (the one you just forked).
2. Click on the `json` folder in the repository.
3. Click the `Upload files` button, select the JSON file you downloaded earlier, and upload it.
4. Make sure the uploaded file is named `pintree.json`, and select `Commit changes`.

![](https://github.com/Pintree-io/pintree/blob/main/assets/guide/step3.png)

### Step 4: Enable GitHub Pages

1. In your `pintree` repository page, click on `Settings`.
2. Find the `Pages` option.
3. In the `Source` dropdown menu, select the `gh-pages` branch and click `Save`.
4. After a few minutes, your static website will be available at `https://yourusername.github.io/pintree`. Remember to replace `yourusername`.

![](https://github.com/Pintree-io/pintree/blob/main/assets/guide/step4.png)

## Technologies Used

- HTML/CSS/JavaScript
- JSON format processing
- Static website hosting

## Contribution Guidelines

Contributions are welcome! Please follow these steps to participate in the project:

1. Fork this repository: https://github.com/Pintree-io/pintree/tree/main
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Submit a Pull Request

Please note that the `main` branch is the source code branch of the project, while the `gh-pages` branch is the branch for the packaged static website code. Develop and submit changes on the `main` branch, and we will be responsible for packaging and publishing the code to the `gh-pages` branch.

## Contact

If you have any questions or suggestions, please contact us through the following ways:
- Project website: [Pintree](https://pintree.io/)
- Email: viggo.zw@gmail.com

Thank you for using and supporting Pintree!