import { ItemView, WorkspaceLeaf } from 'obsidian';
import ContentLibraryViewerPlugin from './main';

export const VIEW_TYPE_CONTENT_LIBRARY = 'content-library-view';

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

export class ContentLibraryView extends ItemView {
	plugin: ContentLibraryViewerPlugin;
	private currentType: string = 'все';
	private currentViewMode: 'table' | 'cards' = 'table';
	private sortColumn: string = 'название';
	private sortDirection: number = 1;
	private selectedYear: string = '';
	private selectedRating: string = '';
	private selectedStatus: string = '';
	private selectedTag: string = '';
	private contentData: ContentItem[] = [];

	constructor(leaf: WorkspaceLeaf, plugin: ContentLibraryViewerPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentViewMode = plugin.settings.defaultViewMode;
	}

	getViewType(): string {
		return VIEW_TYPE_CONTENT_LIBRARY;
	}

	getDisplayText(): string {
		return 'Content Library';
	}

	getIcon(): string {
		return 'library';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		
		await this.loadAndRender();
	}

	async onClose() {
		// Cleanup
	}

	private async loadAndRender() {
		// Загружаем данные
		this.contentData = await this.plugin.loadContent(this.currentType === 'все' ? undefined : this.currentType);
		
		// Рендерим интерфейс
		this.render();
	}

	private render() {
		const container = this.containerEl.children[1];
		container.empty();

		// Добавляем стили
		this.addStyles();

		// Создаем контейнер
		const viewerContainer = container.createDiv({ cls: 'content-viewer-container' });

		// Создаем панель фильтров
		this.renderFilterBar(viewerContainer);

		// Создаем контейнер для активных фильтров
		const activeFiltersContainer = viewerContainer.createDiv({ cls: 'active-filters' });
		this.renderActiveFilters(activeFiltersContainer);

		// Рендерим контент
		this.renderContent(viewerContainer);
	}

	private renderFilterBar(container: HTMLElement) {
		const filterWrapper = container.createDiv({ cls: 'filter-wrapper' });

		// 1. Выбор типа контента
		const typeSelect = filterWrapper.createEl('select', { cls: 'type-select' });
		
		const allOption = typeSelect.createEl('option', { text: 'Все', value: 'все' });
		if (this.currentType === 'все') allOption.selected = true;

		for (const [key, config] of Object.entries(this.plugin.settings.contentTypes)) {
			if (!config.enabled) continue;
			const opt = typeSelect.createEl('option', { text: config.label, value: key });
			if (key === this.currentType) opt.selected = true;
		}

		typeSelect.addEventListener('change', async () => {
			this.currentType = typeSelect.value;
			await this.loadAndRender();
		});

		// 2. Кнопка фильтров
		const filterBtnContainer = filterWrapper.createDiv({ cls: 'filter-btn-container' });
		filterBtnContainer.style.position = 'relative';
		
		const filterBtn = filterBtnContainer.createEl('button', { 
			cls: 'filter-btn',
			text: 'Сортировка и фильтры'
		});

		const filterMenu = this.createFilterMenu();
		filterBtnContainer.appendChild(filterMenu);

		filterBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			filterMenu.classList.toggle('active');
		});

		document.addEventListener('click', (e) => {
			if (!filterBtnContainer.contains(e.target as Node)) {
				filterMenu.classList.remove('active');
			}
		});

		// 3. Поиск
		const searchInput = filterWrapper.createEl('input', { 
			cls: 'search-input',
			type: 'text',
			placeholder: '🔍 Поиск по названию...'
		});

		let searchTimer: NodeJS.Timeout;
		searchInput.addEventListener('input', () => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => this.render(), 300);
		});

		// 4. Кнопки переключения вида
		const viewControls = filterWrapper.createDiv({ cls: 'view-controls' });

		const tableBtn = viewControls.createEl('button', {
			cls: `view-btn ${this.currentViewMode === 'table' ? 'active' : ''}`,
			title: 'Таблица'
		});
		tableBtn.innerHTML = '<span class="view-btn-icon">📊</span><span class="view-btn-text">Таблица</span>';
		tableBtn.addEventListener('click', () => {
			this.currentViewMode = 'table';
			this.render();
		});

		const cardsBtn = viewControls.createEl('button', {
			cls: `view-btn ${this.currentViewMode === 'cards' ? 'active' : ''}`,
			title: 'Карточки'
		});
		cardsBtn.innerHTML = '<span class="view-btn-icon">🃏</span><span class="view-btn-text">Карточки</span>';
		cardsBtn.addEventListener('click', () => {
			this.currentViewMode = 'cards';
			this.render();
		});
	}

	private createFilterMenu(): HTMLElement {
		const filterMenu = document.createElement('div');
		filterMenu.className = 'filter-menu';

		const filterGrid = filterMenu.createDiv({ cls: 'filter-grid' });

		// Получаем уникальные значения для фильтров из текущих данных
		const years = this.getUniqueYears();
		const tags = this.getUniqueTags();

		// Фильтр по году
		this.createYearFilter(filterGrid, years);

		// Фильтр по рейтингу (только для определенных типов)
		if (this.shouldShowRatingFilter()) {
			this.createRatingFilter(filterGrid);
		}

		// Фильтр по статусу (динамический в зависимости от типа)
		this.createStatusFilter(filterGrid);

		// Фильтр по тегам
		this.createTagsFilter(filterGrid, tags);

		return filterMenu;
	}

	private shouldShowRatingFilter(): boolean {
		// Показываем рейтинг для всех типов кроме книг
		return this.currentType !== 'книги';
	}

	private getStatusOptionsForType(): Array<{value: string, text: string, icon: string}> {
		const commonOptions = [
			{ value: '', text: 'Все', icon: '📋' }
		];

		// Динамические опции в зависимости от типа
		switch(this.currentType) {
			case 'игры':
				return [
					...commonOptions,
					{ value: 'прошел', text: 'Пройдено', icon: '✅' },
					{ value: 'прохожу', text: 'Прохожу', icon: '▶️' },
					{ value: 'буду проходить', text: 'Буду проходить', icon: '⏳' },
					{ value: 'забросил', text: 'Заброшено', icon: '❌' }
				];
			case 'книги':
			case 'манга':
				return [
					...commonOptions,
					{ value: 'прочитал', text: 'Прочитано', icon: '✅' },
					{ value: 'читаю', text: 'Читаю', icon: '▶️' },
					{ value: 'буду читать', text: 'Буду читать', icon: '⏳' },
					{ value: 'забросил', text: 'Заброшено', icon: '❌' }
				];
			default: // фильмы, сериалы, аниме
				return [
					...commonOptions,
					{ value: 'просмотрел', text: 'Просмотрено', icon: '✅' },
					{ value: 'смотрю', text: 'Смотрю', icon: '▶️' },
					{ value: 'буду смотреть', text: 'Буду смотреть', icon: '⏳' },
					{ value: 'забросил', text: 'Заброшено', icon: '❌' }
				];
		}
	}

	private createYearFilter(container: HTMLElement, years: number[]) {
		const filterItem = container.createDiv({ cls: 'filter-item' });
		filterItem.createDiv({ cls: 'filter-label', text: '📅 Год выхода' });

		const controls = filterItem.createDiv({ cls: 'filter-controls' });
		const select = controls.createEl('select', { cls: 'filter-select' });
		
		select.createEl('option', { text: 'Все годы', value: '' });
		years.forEach(year => {
			const opt = select.createEl('option', { text: year.toString(), value: year.toString() });
			if (year.toString() === this.selectedYear) opt.selected = true;
		});

		select.addEventListener('change', () => {
			this.selectedYear = select.value;
			this.render();
			const menu = container.closest('.filter-menu');
			if (menu) menu.classList.remove('active');
		});
	}

	private createRatingFilter(container: HTMLElement) {
		const filterItem = container.createDiv({ cls: 'filter-item' });
		filterItem.createDiv({ cls: 'filter-label', text: '⭐ Рейтинг' });

		const controls = filterItem.createDiv({ cls: 'filter-controls' });
		const options = controls.createDiv({ cls: 'filter-options' });

		const ratings = [
			{ value: '', text: 'Все', icon: '⭐' },
			{ value: '10', text: '10', icon: '⭐⭐⭐⭐⭐' },
			{ value: '9', text: '9', icon: '⭐⭐⭐⭐' },
			{ value: '8', text: '8', icon: '⭐⭐⭐' },
			{ value: '7', text: '7', icon: '⭐⭐' },
			{ value: '6', text: '6', icon: '⭐' },
			{ value: '5', text: '5+', icon: '⭐' },
			{ value: '0', text: 'Без оценки', icon: '—' }
		];

		ratings.forEach(rating => {
			const option = options.createDiv({ cls: 'filter-option' });
			option.setAttribute('data-value', rating.value);
			if (rating.value === this.selectedRating) option.addClass('active');
			option.innerHTML = `
				<span class="filter-option-icon">${rating.icon}</span>
				<span class="filter-option-text">${rating.text}</span>
			`;

			option.addEventListener('click', () => {
				options.querySelectorAll('.filter-option').forEach(opt => opt.removeClass('active'));
				option.addClass('active');
				this.selectedRating = rating.value;
				this.render();
				const menu = container.closest('.filter-menu');
				if (menu) menu.classList.remove('active');
			});
		});
	}

	private createStatusFilter(container: HTMLElement) {
		const filterItem = container.createDiv({ cls: 'filter-item' });
		filterItem.createDiv({ cls: 'filter-label', text: '📊 Статус' });

		const controls = filterItem.createDiv({ cls: 'filter-controls' });
		const options = controls.createDiv({ cls: 'filter-options' });

		const statuses = this.getStatusOptionsForType();

		statuses.forEach(status => {
			const option = options.createDiv({ cls: 'filter-option' });
			option.setAttribute('data-value', status.value);
			if (status.value === this.selectedStatus) option.addClass('active');
			option.innerHTML = `
				<span class="filter-option-icon">${status.icon}</span>
				<span class="filter-option-text">${status.text}</span>
			`;

			option.addEventListener('click', () => {
				options.querySelectorAll('.filter-option').forEach(opt => opt.removeClass('active'));
				option.addClass('active');
				this.selectedStatus = status.value;
				this.render();
				const menu = container.closest('.filter-menu');
				if (menu) menu.classList.remove('active');
			});
		});
	}

	private createTagsFilter(container: HTMLElement, tags: string[]) {
		const filterItem = container.createDiv({ cls: 'filter-item' });
		filterItem.createDiv({ cls: 'filter-label', text: '🏷️ Теги' });

		const controls = filterItem.createDiv({ cls: 'filter-controls' });
		const select = controls.createEl('select', { cls: 'filter-select' });
		
		select.createEl('option', { text: 'Все теги', value: '' });
		tags.forEach(tag => {
			const opt = select.createEl('option', { text: tag, value: tag });
			if (tag === this.selectedTag) opt.selected = true;
		});

		select.addEventListener('change', () => {
			this.selectedTag = select.value;
			this.render();
			const menu = container.closest('.filter-menu');
			if (menu) menu.classList.remove('active');
		});
	}

	private renderActiveFilters(container: HTMLElement) {
		container.empty();

		const filters: Array<{text: string, type: string, icon: string}> = [];

		if (this.selectedYear) {
			filters.push({ text: `Год: ${this.selectedYear}`, type: 'year', icon: '📅' });
		}
		if (this.selectedRating) {
			filters.push({ text: `Рейтинг: ${this.selectedRating}`, type: 'rating', icon: '⭐' });
		}
		if (this.selectedStatus) {
			filters.push({ text: `Статус: ${this.selectedStatus}`, type: 'status', icon: '📊' });
		}
		if (this.selectedTag) {
			filters.push({ text: `Тег: ${this.selectedTag}`, type: 'tag', icon: '🏷️' });
		}

		filters.forEach(filter => {
			const filterEl = container.createDiv({ cls: 'active-filter' });
			filterEl.innerHTML = `
				${filter.icon} ${filter.text}
				<button class="remove-filter" data-type="${filter.type}">×</button>
			`;

			const removeBtn = filterEl.querySelector('.remove-filter');
			removeBtn?.addEventListener('click', () => {
				switch(filter.type) {
					case 'year': this.selectedYear = ''; break;
					case 'rating': this.selectedRating = ''; break;
					case 'status': this.selectedStatus = ''; break;
					case 'tag': this.selectedTag = ''; break;
				}
				this.render();
			});
		});
	}

	private renderContent(container: HTMLElement) {
		// Фильтруем данные
		let filtered = this.filterContent();

		// Сортируем
		filtered = this.sortData(filtered);

		// Удаляем старый контент
		const oldContent = container.querySelector('.table-view, .cards-view, .no-results-message');
		if (oldContent) oldContent.remove();

		if (filtered.length === 0) {
			container.createEl('p', {
				cls: 'no-results-message',
				text: 'Нет контента по выбранным фильтрам.'
			});
			return;
		}

		// Рендерим в зависимости от режима
		if (this.currentViewMode === 'table') {
			this.renderTable(container, filtered);
		} else {
			this.renderCards(container, filtered);
		}
	}

	private filterContent(): ContentItem[] {
		const searchInput = this.containerEl.querySelector('.search-input') as HTMLInputElement;
		const searchTerm = searchInput?.value.toLowerCase() || '';

		return this.contentData.filter(item => {
			// Поиск по названию
			if (searchTerm && !item.название.toLowerCase().includes(searchTerm)) {
				return false;
			}

			// Фильтр по году
			if (this.selectedYear && item['год выхода']?.toString() !== this.selectedYear) {
				return false;
			}

			// Фильтр по рейтингу
			if (this.selectedRating) {
				const rating = item.рейтинг || item['мой рейтинг'];
				if (this.selectedRating === '0' && rating) return false;
				if (this.selectedRating !== '0' && this.selectedRating !== '' && rating?.toString() !== this.selectedRating) {
					// Для значения "5+" показываем все от 5 и выше
					if (this.selectedRating === '5' && (!rating || rating < 5)) return false;
					else if (this.selectedRating !== '5') return false;
				}
			}

			// Фильтр по статусу
			if (this.selectedStatus && !item.статус?.includes(this.selectedStatus)) {
				return false;
			}

			// Фильтр по тегам
			if (this.selectedTag && !item.tags?.some(tag => tag.replace(/^#/, '') === this.selectedTag)) {
				return false;
			}

			return true;
		});
	}

	private sortData(data: ContentItem[]): ContentItem[] {
		return [...data].sort((a, b) => {
			let aVal: any = (a as any)[this.sortColumn];
			let bVal: any = (b as any)[this.sortColumn];

			// Специальная обработка для разных типов
			if (this.sortColumn === 'год выхода' || this.sortColumn === 'рейтинг') {
				aVal = parseFloat(aVal) || 0;
				bVal = parseFloat(bVal) || 0;
			}

			if (aVal < bVal) return -1 * this.sortDirection;
			if (aVal > bVal) return 1 * this.sortDirection;
			return 0;
		});
	}

	private renderTable(container: HTMLElement, data: ContentItem[]) {
		const table = container.createEl('table', { cls: 'dataview table-view-table' });

		// Определяем колонки в зависимости от типа
		const columns = this.getColumnsForType();

		// Заголовки
		const headerRow = table.createEl('tr');
		columns.forEach(col => {
			const th = headerRow.createEl('th', { text: col.display });
			th.setAttribute('data-column', col.key);
			
			if (col.key === this.sortColumn) {
				th.addClass(this.sortDirection === 1 ? 'sorted-asc' : 'sorted-desc');
			}

			th.addEventListener('click', () => {
				if (this.sortColumn === col.key) {
					this.sortDirection = -this.sortDirection;
				} else {
					this.sortColumn = col.key;
					this.sortDirection = 1;
				}
				this.render();
			});
		});

		// Строки данных
		data.forEach(item => {
			const row = table.createEl('tr');
			
			columns.forEach(col => {
				const cell = row.createEl('td');
				let content = '';

				switch(col.key) {
					case 'статус':
						content = this.getStatusText(item.статус);
						break;
					case 'tags':
						content = item.tags ? item.tags.slice(0, 3).join(', ') : '—';
						if (item.tags && item.tags.length > 3) {
							content += `... (+${item.tags.length - 3})`;
						}
						break;
					case 'рейтинг':
						const rating = item.рейтинг || item['мой рейтинг'];
						content = rating ? `⭐ ${rating}` : '—';
						break;
					default:
						content = (item as any)[col.key]?.toString() || '—';
				}

				cell.textContent = content;
			});
		});
	}

	private renderCards(container: HTMLElement, data: ContentItem[]) {
		const cardsContainer = container.createDiv({ cls: 'cards-view' });

		data.forEach(item => {
			const card = cardsContainer.createDiv({ cls: 'content-card' });

			// Баннер
			const banner = card.createDiv({ cls: 'card-banner' });
			if (item.баннер) {
				banner.style.backgroundImage = `url(${item.баннер})`;
			} else {
				banner.addClass('no-image');
				banner.textContent = '📚';
			}

			// Контент карточки
			const content = card.createDiv({ cls: 'card-content' });
			
			content.createDiv({ cls: 'card-title', text: item.название || 'Без названия' });

			// Мета-информация
			const meta = content.createDiv({ cls: 'card-meta' });
			if (item._contentType && this.currentType === 'все') {
				meta.createSpan({ cls: 'card-meta-item', text: item._contentType });
			}
			if (item['год выхода']) {
				meta.createSpan({ cls: 'card-meta-item', text: item['год выхода'].toString() });
			}
			if (item.автор) {
				meta.createSpan({ cls: 'card-meta-item', text: item.автор });
			}

			// Статус
			const statusText = this.getStatusText(item.статус);
			if (statusText !== '—') {
				content.createDiv({ cls: 'card-status', text: statusText });
			}

			// Рейтинг
			const rating = item.рейтинг || item['мой рейтинг'];
			if (rating) {
				content.createDiv({ cls: 'card-rating', text: `⭐ ${rating}` });
			}

			// Теги
			if (item.tags && item.tags.length > 0) {
				const tagsDiv = content.createDiv({ cls: 'card-tags' });
				item.tags.slice(0, 3).forEach(tag => {
					tagsDiv.createSpan({ cls: 'card-tag', text: tag });
				});
				if (item.tags.length > 3) {
					tagsDiv.createSpan({ cls: 'card-tag', text: `+${item.tags.length - 3}` });
				}
			}
		});
	}

	private getColumnsForType(): Array<{display: string, key: string}> {
		const baseColumns = [
			{ display: '🎬 Название', key: 'название' },
			{ display: '📅 Год выхода', key: 'год выхода' }
		];

		if (this.currentType === 'все') {
			return [
				{ display: '📄 Тип', key: '_contentType' },
				...baseColumns,
				{ display: '⭐ Рейтинг', key: 'рейтинг' },
				{ display: '📊 Статус', key: 'статус' },
				{ display: '🏷️ Теги', key: 'tags' }
			];
		}

		const columns = [...baseColumns];

		// Добавляем специфичные колонки
		if (this.currentType === 'сериалы' || this.currentType === 'аниме') {
			columns.push({ display: '📺 Серия', key: 'текущая_серия' });
		}
		if (this.currentType === 'книги' || this.currentType === 'манга') {
			columns.push({ display: '📚 Глава', key: 'текущая_серия' });
			if (this.plugin.settings.showAuthorColumn) {
				columns.push({ display: '✍️ Автор', key: 'автор' });
			}
		}

		if (this.shouldShowRatingFilter()) {
			columns.push({ display: '⭐ Рейтинг', key: 'рейтинг' });
		}

		columns.push({ display: '📊 Статус', key: 'статус' });
		columns.push({ display: '🏷️ Теги', key: 'tags' });

		return columns;
	}

	private getStatusText(status?: string[]): string {
		if (!status || status.length === 0) return '—';
		
		const statusKey = status[0];
		const label = this.plugin.settings.customStatusLabels[statusKey];
		return label || statusKey;
	}

	private getUniqueYears(): number[] {
		const years = new Set<number>();
		this.contentData.forEach(item => {
			if (item['год выхода']) years.add(item['год выхода']);
		});
		return Array.from(years).sort((a, b) => b - a);
	}

	private getUniqueTags(): string[] {
		const tags = new Set<string>();
		this.contentData.forEach(item => {
			if (item.tags) {
				item.tags.forEach(tag => tags.add(tag.replace(/^#/, '')));
			}
		});
		return Array.from(tags).sort();
	}

	private addStyles() {
		// Проверяем, не добавлены ли уже стили
		if (document.getElementById('content-library-viewer-styles')) return;

		const style = document.createElement('style');
		style.id = 'content-library-viewer-styles';
		style.textContent = `
			.content-viewer-container {
				width: 100%;
				max-width: 100%;
				padding: 20px;
			}

			.filter-wrapper {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
				margin-bottom: 20px;
				padding: 12px;
				background: var(--background-secondary);
				border-radius: 8px;
				align-items: center;
			}

			.type-select, .filter-select, .search-input {
				padding: 8px 12px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				color: var(--text-normal);
			}

			.type-select {
				min-width: 120px;
			}

			.search-input {
				flex: 1;
				min-width: 200px;
			}

			.filter-btn-container {
				position: relative;
			}

			.filter-btn {
				padding: 8px 16px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				color: var(--text-normal);
				cursor: pointer;
			}

			.filter-btn:hover {
				background: var(--background-modifier-hover);
			}

			.filter-menu {
				position: absolute;
				top: 100%;
				left: 0;
				margin-top: 8px;
				padding: 16px;
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				box-shadow: 0 4px 20px rgba(0,0,0,0.15);
				z-index: 1000;
				display: none;
				min-width: 400px;
			}

			.filter-menu.active {
				display: block;
			}

			.filter-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
				gap: 16px;
			}

			.filter-item {
				display: flex;
				flex-direction: column;
				gap: 8px;
			}

			.filter-label {
				font-weight: 600;
				font-size: 14px;
			}

			.filter-options {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;
			}

			.filter-option {
				padding: 6px 10px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				cursor: pointer;
				font-size: 12px;
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.filter-option:hover {
				background: var(--background-modifier-hover);
			}

			.filter-option.active {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.view-controls {
				display: flex;
				gap: 8px;
				margin-left: auto;
			}

			.view-btn {
				padding: 8px 16px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 6px;
				background: var(--background-primary);
				cursor: pointer;
				display: flex;
				align-items: center;
				gap: 4px;
			}

			.view-btn:hover {
				background: var(--background-modifier-hover);
			}

			.view-btn.active {
				background: var(--interactive-accent);
				color: var(--text-on-accent);
			}

			.active-filters {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				margin-bottom: 12px;
			}

			.active-filter {
				padding: 4px 10px;
				background: var(--interactive-accent);
				color: var(--text-on-accent);
				border-radius: 16px;
				font-size: 12px;
				display: flex;
				align-items: center;
				gap: 6px;
			}

			.remove-filter {
				background: none;
				border: none;
				color: var(--text-on-accent);
				cursor: pointer;
				font-size: 16px;
				padding: 0;
			}

			.dataview.table-view-table {
				width: 100%;
				border-collapse: collapse;
			}

			.dataview.table-view-table th {
				padding: 10px 12px;
				text-align: left;
				border-bottom: 2px solid var(--background-modifier-border);
				background: var(--background-secondary);
				cursor: pointer;
				user-select: none;
			}

			.dataview.table-view-table th:hover {
				background: var(--background-modifier-hover);
			}

			.dataview.table-view-table th.sorted-asc::after {
				content: " ▲";
			}

			.dataview.table-view-table th.sorted-desc::after {
				content: " ▼";
			}

			.dataview.table-view-table td {
				padding: 8px 12px;
				border-bottom: 1px solid var(--background-modifier-border);
			}

			.dataview.table-view-table tr:hover {
				background: var(--background-secondary);
			}

			.cards-view {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
				gap: 16px;
			}

			.content-card {
				background: var(--background-primary);
				border: 1px solid var(--background-modifier-border);
				border-radius: 8px;
				overflow: hidden;
				transition: transform 0.2s;
			}

			.content-card:hover {
				transform: translateY(-2px);
				box-shadow: 0 4px 12px rgba(0,0,0,0.1);
			}

			.card-banner {
				width: 100%;
				height: 160px;
				background: var(--background-secondary);
				background-size: cover;
				background-position: center;
			}

			.card-banner.no-image {
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 48px;
			}

			.card-content {
				padding: 12px;
			}

			.card-title {
				font-weight: 600;
				font-size: 15px;
				margin-bottom: 8px;
			}

			.card-meta {
				display: flex;
				flex-wrap: wrap;
				gap: 8px;
				margin-bottom: 8px;
				font-size: 12px;
				color: var(--text-muted);
			}

			.card-status, .card-rating {
				display: inline-block;
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 11px;
				margin-top: 6px;
				background: var(--background-secondary);
			}

			.card-tags {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;
				margin-top: 8px;
			}

			.card-tag {
				padding: 2px 6px;
				background: var(--background-secondary);
				border-radius: 4px;
				font-size: 11px;
			}

			.no-results-message {
				text-align: center;
				padding: 30px;
				color: var(--text-muted);
				font-style: italic;
			}

			/* Адаптивность */
			@media (max-width: 768px) {
				.view-btn-text {
					display: none;
				}
				
				.filter-wrapper {
					gap: 8px;
				}

				.cards-view {
					grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
				}

				.filter-menu {
					min-width: 300px;
					max-width: 90vw;
				}
			}

			@media (max-width: 480px) {
				.cards-view {
					grid-template-columns: 1fr;
				}
				
				.search-input {
					width: 100%;
				}
			}
		`;

		document.head.appendChild(style);
	}
}
