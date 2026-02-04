# <div align="center">🎬 Scrollbase - Obsidian Media Library Plugin </div>

<div align="center">

<a href="#features"><kbd> <br>✨ Features ✨ <br> </kbd></a>&ensp;&ensp;
<a href="#screenshots"><kbd> <br>🖼️ Screenshots 🖼️ <br> </kbd></a>&ensp;&ensp;
<a href="#installation"><kbd> <br>📥 Installation 📥 <br> </kbd></a>&ensp;&ensp;
<a href="#usage"><kbd> <br>🚀 Usage 🚀 <br> </kbd></a>&ensp;&ensp;
<a href="#configuration"><kbd> <br>⚙️ Configuration ⚙️ <br> </kbd></a>

<br>

<img src="http://estruyf-github.azurewebsites.net/api/VisitorHit?user=stquremwork&repo=scrollbase&countColor=9370DB" alt="Repository Views"/>
<img src="https://img.shields.io/github/stars/stquremwork/scrollbase?style=for-the-badge&label=STARS&color=9370DB" alt="GitHub Stars"/>
<img src="https://img.shields.io/badge/license-MIT-9370DB?style=for-the-badge" alt="License"/>
<br>
<img src="https://img.shields.io/badge/TypeScript-4.7%2B-9370DB?style=for-the-badge" alt="TypeScript"/>
<img src="https://img.shields.io/badge/Obsidian-0.15.0+-9370DB?style=for-the-badge" alt="Obsidian"/>
<img src="https://img.shields.io/badge/version-1.0.0-9370DB?style=for-the-badge" alt="Version"/>

<h3>Universal Media Library Organizer for Obsidian</h3>
<p>Track movies, TV shows, anime, manga, books, and games all in one place</p>

<i>If you like this project, consider supporting its development!</i><br>
<i>Your support helps keep this project alive and updated!</i>

<a href="https://ko-fi.com/stquremwork">
  <img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=2" width="150" alt="Support on Ko-fi">
</a>
</div>

---

<a id="features"></a>

## ✨ Features

> [!IMPORTANT]
> ### 🎯 Core Functionality
> - **📊 Dynamic Filters** - Filters adapt to content type automatically
> - **👁️ Dual View Modes** - Switch between table and card layouts
> - **📱 Responsive Design** - Works seamlessly on all devices
> - **🔍 Smart Sorting** - Sort by any column with direction preservation
> - **⚡ Instant Search** - Real-time title search with debouncing

> [!TIP]
> ### 🎛️ Advanced Filtering
> - **📅 Release Year** - Filter from newest to oldest
> - **⭐ Rating** - 1 to 10 scale or unrated items
> - **📊 Status** - Watched, Watching, Plan to Watch, Dropped
> - **🏷️ Tags** - Filter by all tags from your library
> - **🎨 Visual Indicators** - Active filters displayed with clear buttons

### 📚 Supported Content Types

> [!NOTE]
> Each content type supports custom fields and specific functionality:

| Type | Icon | Key Features |
|------|------|-------------|
| **🎬 Movies** | 🎬 | Title, year, rating, status, tags, banner |
| **📺 TV Shows** | 📺 | Episode/season tracking, progress |
| **🇯🇵 Anime** | 🎌 | Seasonal organization, episode tracking |
| **📖 Manga** | 📖 | Chapter/volume tracking, author info |
| **📚 Books** | 📚 | Part tracking, reading progress |
| **🎮 Games** | 🎮 | Platform, developer, play status |

---

<a id="screenshots"></a>

## 🖼️ Screenshots

<table>
  <tr>
    <th width="25%">Main menu (Cards)</th>
    <th width="25%">Main menu (Table)</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/3bc526f2-c7fc-4303-b51a-9c1698d55cc3" alt="Language Selection" width="100%"/>
      <em></em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/bd715b72-66e4-45de-91fc-7fdff391fff6" alt="English UI" width="100%"/>
      <em></em>
    </td>
  </tr>
</table>
<table>
  <tr>
    <th width="25%">Filters</th>
    <th width="25%">Settings</th>
  </tr>
  <tr>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/055716f8-977a-4e34-83d5-0fb4bdf2e08a" alt="Russian UI" width="100%"/>
      <em></em>
    </td>
    <td align="center">
      <img src="https://github.com/user-attachments/assets/055716f8-977a-4e34-83d5-0fb4bdf2e08a" alt="Russian UI" width="100%"/>
      <em></em>
    </td>
  </tr>
</table>

---

<a id="installation"></a>

## 📥 Installation

> [!TIP]
> ### 📦 Manual Installation (Recommended)
> 1. **Download** the latest release from [Releases page](https://github.com/stquremwork/scrollbase/releases)
> 2. **Extract** `scrollbase.zip` to `.obsidian/plugins/` in your vault
> 3. **Reload** Obsidian and enable **Scrollbase** from Community Plugins
> 4. **Activate** the plugin in your settings

> [!NOTE]
> ### 🔄 Via BRAT (Beta Testing)
> 1. **Install** [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat)
> 2. **Navigate** to Settings → BRAT → Plugins → Add Beta plugin
> 3. **Enter** URL: `https://github.com/stquremwork/scrollbase.git`
> 4. **Enable** Scrollbase from Community Plugins

---

<a id="usage"></a>

## 🚀 Usage

> [!IMPORTANT]
> ### 📁 Library Structure
> Create this organized folder structure in your vault:

```bash
Library/
├── 🎬 Movies/
│   └── Movies.md
├── 📺 TV Shows/
│   └── TV Shows.md
├── 🎌 Anime/
│   └── Anime.md
├── 📖 Manga/
│   └── Manga.md
├── 📚 Books/
│   └── Books.md
└── 🎮 Games/
    └── Games.md
```

### 📝 File Format Examples

> [!TIP]
> Use YAML frontmatter for easy data management:

<details>
<summary>📚 Media Examples</summary>

#### 🎬 Movies Example
```markdown
---
movies:
  - title: "Inception"
    year: 2010
    rating: 9
    status: [watched]
    tags: [sci-fi, thriller, mind-bending]
    banner: "https://example.com/inception.jpg"
    director: "Christopher Nolan"
    duration: "148 min"
  - title: "The Matrix"
    year: 1999
    rating: 10
    status: [watched]
    tags: [sci-fi, action, cyberpunk]
---
```

#### 📺 TV Shows Example
```markdown
---
tv_shows:
  - title: "Breaking Bad"
    year: 2008
    current_episode: "S5E16"
    total_seasons: 5
    rating: 10
    status: [completed]
    tags: [drama, crime, thriller]
    last_watched: "2024-01-15"
---
```

#### 📖 Manga Example
```markdown
---
manga:
  - title: "Berserk"
    author: "Kentaro Miura"
    year: 1989
    current_chapter: 364
    total_chapters: 364
    rating: 10
    status: [reading]
    tags: [dark fantasy, seinen, horror]
    publisher: "Hakusensha"
---
```
</details>

---

<a id="configuration"></a>

## ⚙️ Configuration

> [!IMPORTANT]
> Access settings via **Settings → Scrollbase Plugin**

### 🔧 General Settings

> [!NOTE]
> | Setting | Default | Description |
> |---------|---------|-------------|
> | **Library Path** | `Library` | Root folder for media files |
> | **Default View** | `Table` | Initial display mode |
> | **Items Per Page** | `50` | Pagination limit |
> | **Auto-refresh** | `Enabled` | Update on file changes |
> | **Language** | `English` | Interface language |

### 🎛️ Content Type Settings

> [!TIP]
> Customize each media type individually:
> - **Enable/Disable** specific types
> - **Custom folder paths**
> - **Display names**
> - **Visible columns**
> - **Sort preferences**

### 👁️ Display Options

> [!NOTE]
> - **Rating Display**: Stars 🌟 or numbers 🔢
> - **Progress Bars**: Visual completion indicators
> - **Compact Mode**: Dense layout for more items
> - **Banner Size**: Small/Medium/Large
> - **Color Scheme**: Light/Dark/Auto

### ⚡ Advanced Settings

> [!WARNING]
> **Performance & Data Settings**
> - **Cache Duration**: `30` minutes
> - **Search Debounce**: `300` ms
> - **Backup Interval**: `24` hours
> - **Image Cache**: `100` MB limit
> - **Debug Mode**: Off by default

---

## 💖 Support & Community

### 🌟 If Scrollbase helps you organize your media:
- ⭐ **Star the repository** on GitHub
- 🐛 **Report issues** and suggest features
- 📢 **Share** with fellow Obsidian users
- 💬 **Join discussions** about media organization
- ☕ **Support development** with a coffee

<br>

## 📊 Project Statistics


<div align="center">
  
[![Stargazers](https://reporoster.com/stars/dark/stquremwork/scrollbase)](https://github.com/stquremwork/scrollbase/stargazers)

[![Star History Chart](https://api.star-history.com/svg?repos=stquremwork/scrollbase&type=Date&theme=dark)](https://www.star-history.com/#stquremwork/scrollbase&Date)

<br>

**🎬 Made with ❤️ for media enthusiasts and Obsidian users worldwide**

</div>
