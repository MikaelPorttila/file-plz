# 📂 File Please

**A simple command-line tool to generate files of various types and specific sizes.**

---

## 🚀 Features

- 📁 **Create files of common types** (e.g., `.txt`, `.zip`, `.jpg`, etc.)
- 📏 **Specify exact file size** (e.g., 10KB, 5MB, 1GB, etc.)
- ⚡ **Fast and lightweight** utility

---

## 📋 Prerequisites

- **Node.js v22.12 (LTS)**

---

## 🔧 Installation

**Install globally using npm:**
   ```bash
   npm install file-plz -g
   ```
---

## 📘 Usage

**Basic usage:**
```bash
npx file-plz --t txt -s 10KB
```

**Options:**
| Option         | Description                         | Example           |
|----------------|-------------------------------------|-------------------|
| `--size`       | Size of the file (KB, MB, or GB)    | `10KB`, `5MB`     |
| `--type`       | File extension                      | `jpg`, `txt`      |

---

## 📦 Examples

1. **Create a 1MB text file**
   ```bash
   npx file-plz -t txt -s 1MB
   ```

2. **Create a 500KB bitmap file**
   ```bash
   npx file-plz -t txt --size 500KB --t .bmp
   ```

3. **Create a 1GB archive file**
   ```bash
   npx file-plz -t zip -size 1GB
   ```

---

## 🛠️ How It Works

- **File Generation**: The program has a set of base instructions to create simple files which are merged with more complexed file types.
- **Data**: The data within the files are random characters or generated noise.

---

## ⚠️ Challenges with File Size Accuracy

Achieving precise file sizes can be challenging, especially when working with compression and noise. For compressed file types (like `.zip`), the final size depends on the compressibility of the file's contents. Random data is less compressible than repeating patterns, which can affect the actual size. Similarly, files with "noise" data may not be perfectly predictable in size, as different file systems and tools may handle binary data differently. This tool strives to get as close as possible to the requested size, but minor deviations may occur.

---

## 🐛 Issues & Contributions

- Found a bug? Open an issue [here](https://github.com/MikaelPorttila/file-plz/issues).
- Want to contribute? Fork the repo, make changes, and submit a pull request.

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

⭐ **If you find this tool useful, please give it a star!**

