# Scrollbase Plugin for Obsidian
Universal plugin for viewing and organizing media library in Obsidian with support for movies, TV shows, anime, manga, books, and games.

<div align="center">

<a href="#features"><kbd> <br> Features <br> </kbd></a>&ensp;&ensp;
<a href="#installation"><kbd> <br> Installation <br> </kbd></a>&ensp;&ensp;
<a href="#usage"><kbd> <br> Usage <br> </kbd></a>&ensp;&ensp;
<a href="#configuration"><kbd> <br> Configuration <br> </kbd></a>&ensp;&ensp;
<a href="#development"><kbd> <br> Development <br> </kbd></a>&ensp;&ensp;

<br>

<img src="http://estruyf-github.azurewebsites.net/api/VisitorHit?user=stquremwork&repo=cirrus-tl&countColor=9370DB" alt="Repository Views"/>
<img src="https://img.shields.io/github/stars/stquremwork/cirrus-tl?style=for-the-badge&label=STARS&color=9370DB" alt="GitHub Stars"/>
<img src="https://img.shields.io/badge/TypeScript-4.7%2B-3178C6?style=for-the-badge" alt="TypeScript"/>
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="License"/>
<img src="https://img.shields.io/badge/Obsidian-0.15.0+-purple?style=for-the-badge" alt="Obsidian"/>
<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" alt="Version"/>

<i>If you like this project, consider supporting its development!</i><br>
<i>Your support helps keep this project alive and updated!</i>

<a href="https://ko-fi.com/stquremwork">
  <img src="https://cdn.ko-fi.com/cdn/kofi3.png?v=2" width="150" alt="Support on Ko-fi">
</a>
</div>

<br>

<a id="features"></a>

## ✨ Features

### Core Functionality
- **Dynamic Filters** - Filters adapt to content type
- **Dual View Modes** - Table and card layouts
- **Responsive Design** - Works on all devices
- **Smart Sorting** - Sort by any column with direction preservation
- **Instant Search** - Real-time title search with debouncing

### Advanced Filtering
- **Release Year** - Newest to oldest
- **Rating** - 1 to 10 or unrated
- **Status** - Watched, Watching, Plan to Watch, Dropped
- **Tags** - All tags from your library
- **Visual Indicators** - Active filters displayed with clear buttons

### Supported Content Types
- **Movies** - Title, year, rating, status, tags, banner
- **TV Shows** - + current episode, season
- **Anime** - + current episode
- **Manga** - + current chapter/volume, author
- **Books** - + current part, author
- **Games** - Title, year, rating, developer, status

<a id="installation"></a>

## 📥 Installation

### Manual Installation
1. Download the latest release from the [Releases page](https://github.com/stquremwork/scrollbase-obsidian-plugin/releases).
2. Extract `scrollbase-obsidian-plugin.zip` into your vault's `.obsidian/plugins/` folder.
3. Reload Obsidian and enable **Scrollbase**.

### Via BRAT
1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat).
2. Go to **Settings > BRAT > Plugins > Add Beta plugin**.
3. Enter the repository URL: `https://github.com/stquremwork/scrollbase-obsidian-plugin.git`.
4. Enable the plugin.


<a id="usage"></a>

## 🚀 Usage

### Library Structure
Create the following folder structure in your vault:

```
Library/
├── Movies/
│   └── Movies.md
├── TV Shows/
│   └── TV Shows.md
├── Anime/
│   └── Anime.md
├── Manga/
│   └── Manga.md
├── Books/
│   └── Books.md
└── Games/
    └── Games.md
```

### File Format
Use YAML frontmatter to store your media data:

#### Example for Movies
```markdown
---
movies:
  - title: Inception
    year: 2010
    rating: 9
    status: [watched]
    tags: [sci-fi, thriller]
    banner: https://example.com/inception.jpg
  - title: Interstellar
    year: 2014
    rating: 10
    status: [watched]
    tags: [sci-fi, drama]
---
```

#### Example for TV Shows/Anime
```markdown
---
tv_shows:
  - title: Breaking Bad
    year: 2008
    current_episode: S5E16
    rating: 10
    status: [watched]
    tags: [drama, crime]
---
```

#### Example for Manga/Books
```markdown
---
manga:
  - title: Berserk
    author: Kentaro Miura
    current_chapter: 364
    rating: 10
    status: [reading]
    tags: [dark fantasy, seinen]
---
```

<a id="configuration"></a>

## ⚙️ Configuration

Access plugin settings through Obsidian Settings → Scrollbase Plugin.

### General Settings
- **Library Path:** Root folder (default: `Library`)
- **Default View Mode:** Table or Cards
- **Items Per Page:** Number of items to display (default: 50)
- **Enable Auto-refresh:** Refresh when files change

### Content Type Settings
For each content type you can:
- Enable/disable the type
- Customize folder path
- Change display name
- Configure visible columns

### Display Options
- **Show Author Column:** For books, manga, games
- **Show Progress Column:** Current episode/chapter
- **Show Rating Stars:** Display ratings as stars instead of numbers
- **Compact Mode:** Reduce spacing for more items

### Advanced Settings
- **Cache Duration:** How long to cache data (minutes)
- **Debounce Search:** Delay for search input (ms)
- **Backup Interval:** Auto-backup frequency (hours)

<a id="development"></a>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💖 Support

If you find this plugin useful, please consider:

- ⭐ Starring the repository on GitHub
- 🐛 Reporting bugs and suggesting features
- 📢 Sharing with other Obsidian users
- ☕ [Buying me a coffee](https://ko-fi.com/stquremwork)

---

**Made with ❤️ for the Obsidian community**

## 🔧 Development

<div align="center">
  
[![Stargazers](https://reporoster.com/stars/dark/stquremwork/scrollbase)](https://github.com/stquremwork/scrollbase/stargazers)

[![Star History Chart](https://api.star-history.com/svg?repos=stquremwork/scrollbase&type=Date&theme=dark)](https://www.star-history.com/stquremwork/scrollbase)

</div>
