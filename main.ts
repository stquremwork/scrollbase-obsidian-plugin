import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, Notice, WorkspaceLeaf } from 'obsidian';
import { ContentLibraryView, VIEW_TYPE_CONTENT_LIBRARY } from './view';

interface ContentItem {
	название: string;
	автор?: string;
	'год выхода'?: number;
	текущая_серия?: string;
	статус?: string[];
	рейтинг?: number;
	баннер?: string;
	tags?: string[];
	'мой рейтинг'?: number;
	_contentType?: string;
	_yamlKey?: string;
	_fromList?: boolean;
	file?: {
		path: string;
		name: string;
	};
}

interface ContentLibrarySettings {
	libraryPath: string;
	contentTypes: {
		[key: string]: {
			folder: string;
			enabled: boolean;
			label: string;
		};
	};
	defaultViewMode: 'table' | 'cards';
	showAuthorColumn: boolean;
	showProgressColumn: boolean;
	customStatusLabels: {
		[key: string]: string;
	};
}

const DEFAULT_SETTINGS: ContentLibrarySettings = {
	libraryPath: 'Библиотека',
	contentTypes: {
		'аниме': { folder: 'Библиотека/Аниме', enabled: true, label: 'Аниме' },
		'манга': { folder: 'Библиотека/Манга', enabled: true, label: 'Манга' },
		'игры': { folder: 'Библиотека/Игры', enabled: true, label: 'Игры' },
		'книги': { folder: 'Библиотека/Книги', enabled: true, label: 'Книги' },
		'фильмы': { folder: 'Библиотека/Фильмы', enabled: true, label: 'Фильмы' },
		'сериалы': { folder: 'Библиотека/Сериалы', enabled: true, label: 'Сериалы' }
	},
	defaultViewMode: 'table',
	showAuthorColumn: true,
	showProgressColumn: true,
	customStatusLabels: {
		'просмотрел': 'Просмотрено',
		'прошел': 'Пройдено',
		'смотрю': 'Смотрю',
		'прохожу': 'Прохожу',
		'буду смотреть': 'Буду смотреть',
		'буду проходить': 'Буду проходить',
		'забросил': 'Заброшено'
	}
};

export default class ContentLibraryViewerPlugin extends Plugin {
	settings: ContentLibrarySettings;

	async onload() {
		await this.loadSettings();

		// Регистрируем View
		this.registerView(
			VIEW_TYPE_CONTENT_LIBRARY,
			(leaf: WorkspaceLeaf) => new ContentLibraryView(leaf, this)
		);

		// Добавляем команду для открытия просмотрщика
		this.addCommand({
			id: 'open-content-library-viewer',
			name: 'Открыть просмотрщик библиотеки',
			callback: () => {
				this.openContentViewer();
			}
		});

		// Добавляем кнопку на ленту
		this.addRibbonIcon('library', 'Content Library Viewer', () => {
			this.openContentViewer();
		});

		// Добавляем настройки
		this.addSettingTab(new ContentLibrarySettingTab(this.app, this));

		console.log('Content Library Viewer plugin loaded');
	}

	onunload() {
		console.log('Content Library Viewer plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async openContentViewer() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CONTENT_LIBRARY);

		if (leaves.length > 0) {
			// View уже открыт, активируем его
			leaf = leaves[0];
		} else {
			// Создаем новый View
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({
				type: VIEW_TYPE_CONTENT_LIBRARY,
				active: true,
			});
		}

		// Активируем View
		workspace.revealLeaf(leaf);
	}

	// Метод для загрузки контента из файлов
	async loadContent(type?: string): Promise<ContentItem[]> {
		const allContent: ContentItem[] = [];
		const typesToLoad = type && type !== 'все' 
			? [type] 
			: Object.keys(this.settings.contentTypes).filter(t => this.settings.contentTypes[t].enabled);

		for (const contentType of typesToLoad) {
			const typeConfig = this.settings.contentTypes[contentType];
			if (!typeConfig || !typeConfig.enabled) continue;

			const folder = this.app.vault.getAbstractFileByPath(typeConfig.folder);
			if (!(folder instanceof TFolder)) continue;

			await this.loadContentFromFolder(folder, contentType, allContent);
		}

		return allContent;
	}

	private async loadContentFromFolder(folder: TFolder, contentType: string, result: ContentItem[]) {
		for (const file of folder.children) {
			if (file instanceof TFile && file.extension === 'md') {
				const content = await this.app.vault.read(file);
				const items = this.parseContentFile(content, file, contentType);
				result.push(...items);
			} else if (file instanceof TFolder) {
				await this.loadContentFromFolder(file, contentType, result);
			}
		}
	}

	private parseContentFile(content: string, file: TFile, contentType: string): ContentItem[] {
		const items: ContentItem[] = [];
		
		// Парсим YAML frontmatter
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) return items;

		const frontmatter = frontmatterMatch[1];
		
		// Ищем массивы в YAML
		const listMatch = frontmatter.match(new RegExp(`${contentType}:\\s*\\n([\\s\\S]*?)(?=\\n\\w+:|$)`, 'i'));
		
		if (listMatch) {
			// Парсим список элементов
			const listContent = listMatch[1];
			const itemMatches = listContent.matchAll(/- название:\s*([^\n]+)/g);
			
			for (const match of itemMatches) {
				const itemStart = listContent.indexOf(match[0]);
				const nextItemMatch = listContent.indexOf('- название:', itemStart + 1);
				const itemContent = nextItemMatch === -1 
					? listContent.slice(itemStart)
					: listContent.slice(itemStart, nextItemMatch);
				
				const item = this.parseYamlItem(itemContent, file, contentType);
				if (item) items.push(item);
			}
		} else {
			// Проверяем, есть ли отдельные поля для одного элемента
			const singleItem = this.parseSingleItem(frontmatter, file, contentType);
			if (singleItem && singleItem.название) {
				items.push(singleItem);
			}
		}

		return items;
	}

	private parseYamlItem(itemContent: string, file: TFile, contentType: string): ContentItem | null {
		const item: ContentItem = {
			название: '',
			_contentType: this.settings.contentTypes[contentType]?.label || contentType,
			_yamlKey: contentType,
			_fromList: true,
			file: {
				path: file.path,
				name: file.name
			}
		};

		// Извлекаем поля
		const fields = {
			название: /название:\s*([^\n]+)/,
			автор: /автор:\s*([^\n]+)/,
			'год выхода': /(?:год|год выхода):\s*(\d+)/,
			текущая_серия: /(?:текущая серия|серия|глава|том):\s*([^\n]+)/,
			рейтинг: /рейтинг:\s*([\d.]+)/,
			баннер: /баннер:\s*([^\n]+)/,
			статус: /статус:\s*\[([^\]]+)\]/
		};

		for (const [key, regex] of Object.entries(fields)) {
			const match = itemContent.match(regex);
			if (match) {
				if (key === 'статус') {
					item.статус = match[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
				} else if (key === 'год выхода' || key === 'рейтинг') {
					(item as any)[key] = parseFloat(match[1]);
				} else {
					(item as any)[key] = match[1].trim();
				}
			}
		}

		// Извлекаем теги
		const tagsMatch = itemContent.match(/(?:теги|tags):\s*\[([^\]]+)\]/);
		if (tagsMatch) {
			item.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
		}

		return item.название ? item : null;
	}

	private parseSingleItem(frontmatter: string, file: TFile, contentType: string): ContentItem {
		const item: ContentItem = {
			название: '',
			_contentType: this.settings.contentTypes[contentType]?.label || contentType,
			file: {
				path: file.path,
				name: file.name
			}
		};

		const nameMatch = frontmatter.match(/название:\s*([^\n]+)/);
		if (nameMatch) item.название = nameMatch[1].trim();

		const authorMatch = frontmatter.match(/автор:\s*([^\n]+)/);
		if (authorMatch) item.автор = authorMatch[1].trim();

		const yearMatch = frontmatter.match(/(?:год|год выхода):\s*(\d+)/);
		if (yearMatch) item['год выхода'] = parseInt(yearMatch[1]);

		const ratingMatch = frontmatter.match(/рейтинг:\s*([\d.]+)/);
		if (ratingMatch) item.рейтинг = parseFloat(ratingMatch[1]);

		const statusMatch = frontmatter.match(/статус:\s*\[([^\]]+)\]/);
		if (statusMatch) {
			item.статус = statusMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
		}

		const tagsMatch = frontmatter.match(/(?:теги|tags):\s*\[([^\]]+)\]/);
		if (tagsMatch) {
			item.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/['"#]/g, ''));
		}

		return item;
	}
}

class ContentLibrarySettingTab extends PluginSettingTab {
	plugin: ContentLibraryViewerPlugin;

	constructor(app: App, plugin: ContentLibraryViewerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Content Library Viewer Settings' });

		// Основной путь к библиотеке
		new Setting(containerEl)
			.setName('Путь к библиотеке')
			.setDesc('Основная папка с вашей медиа-библиотекой')
			.addText(text => text
				.setPlaceholder('Библиотека')
				.setValue(this.plugin.settings.libraryPath)
				.onChange(async (value) => {
					this.plugin.settings.libraryPath = value;
					await this.plugin.saveSettings();
				}));

		// Режим отображения по умолчанию
		new Setting(containerEl)
			.setName('Режим отображения по умолчанию')
			.setDesc('Выберите, как отображать контент при открытии')
			.addDropdown(dropdown => dropdown
				.addOption('table', 'Таблица')
				.addOption('cards', 'Карточки')
				.setValue(this.plugin.settings.defaultViewMode)
				.onChange(async (value: 'table' | 'cards') => {
					this.plugin.settings.defaultViewMode = value;
					await this.plugin.saveSettings();
				}));

		// Настройки колонок
		containerEl.createEl('h3', { text: 'Отображение колонок' });

		new Setting(containerEl)
			.setName('Показывать колонку "Автор"')
			.setDesc('Отображать информацию об авторе в таблице')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showAuthorColumn)
				.onChange(async (value) => {
					this.plugin.settings.showAuthorColumn = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Показывать колонку "Прогресс"')
			.setDesc('Отображать текущую серию/главу')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showProgressColumn)
				.onChange(async (value) => {
					this.plugin.settings.showProgressColumn = value;
					await this.plugin.saveSettings();
				}));

		// Настройки типов контента
		containerEl.createEl('h3', { text: 'Типы контента' });
		containerEl.createEl('p', { 
			text: 'Настройте папки и названия для каждого типа контента',
			cls: 'setting-item-description'
		});

		for (const [key, config] of Object.entries(this.plugin.settings.contentTypes)) {
			new Setting(containerEl)
				.setName(config.label)
				.setDesc(`Папка: ${config.folder}`)
				.addToggle(toggle => toggle
					.setValue(config.enabled)
					.onChange(async (value) => {
						this.plugin.settings.contentTypes[key].enabled = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('Путь к папке')
					.setValue(config.folder)
					.onChange(async (value) => {
						this.plugin.settings.contentTypes[key].folder = value;
						await this.plugin.saveSettings();
					}));
		}

		// Поддержка разработчика
		containerEl.createEl('h3', { text: 'Поддержать разработку' });
		
		const supportDiv = containerEl.createDiv({ cls: 'setting-item-description' });
		supportDiv.createEl('p', { 
			text: 'Если вам нравится этот плагин, вы можете поддержать его разработку:' 
		});
		
		const kofiLink = supportDiv.createEl('a', { 
			text: '☕ Купить мне кофе на Ko-fi',
			href: 'https://ko-fi.com/'
		});
		kofiLink.setAttr('target', '_blank');
		kofiLink.setAttr('style', 'display: inline-block; padding: 8px 16px; background: #29abe0; color: white; text-decoration: none; border-radius: 4px; margin-top: 8px;');
	}
}
