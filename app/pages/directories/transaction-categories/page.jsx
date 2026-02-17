'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/app/lib/utils'
import { useDeleteChartOfAccounts } from '@/hooks/useDashboard'
import CreateChartOfAccountsModal from '@/components/directories/CreateChartOfAccountsModal/CreateChartOfAccountsModal'
import EditChartOfAccountsModal from '@/components/directories/EditChartOfAccountsModal/EditChartOfAccountsModal'
import { CategoryMenu } from '@/components/directories/CategoryMenu/CategoryMenu'
import { DeleteCategoryConfirmModal } from '@/components/directories/DeleteCategoryConfirmModal/DeleteCategoryConfirmModal'
import { showSuccessNotification, showErrorNotification } from '@/lib/utils/notifications'
import styles from './transaction-categories.module.scss'
import { useChartOfAccountsPlanFact } from '../../../../hooks/useDashboard'

// Recursive component for rendering category tree
function CategoryTreeItem({
	category,
	level = 0,
	categoryIndex = 0,
	expandedCategories,
	closingCategories,
	selectedCategory,
	onToggleCategory,
	onSelectCategory,
	onEditCategory,
	onDeleteCategory,
	onAddChild,
	styles,
	cn,
	isLast = false,
	parentPath = '',
}) {
	const hasChildren = category.children && category.children.length > 0
	const isExpanded = expandedCategories.includes(category.id)
	const isClosing = closingCategories.includes(category.id)
	const isSelected = selectedCategory === category.id
	
	// Create unique path for this item
	const currentPath = parentPath ? `${parentPath}/${category.id}` : category.id

	// Debug: log category data for children
	// if (level > 0) {
	// 	console.log(`CategoryTreeItem level ${level}:`, {
	// 		name: category.name,
	// 		guid: category.guid,
	// 		id: category.id,
	// 		hasMenu: category.hasMenu,
	// 		hasChildren,
	// 	})
	// }

	return (
		<div
			className={cn(
				level === 0 ? styles.categoryItem : styles.childItem,
				isLast && level === 0 && styles.lastCategoryItem,
			)}
		>
			<div
				data-category-card
				className={cn(
					styles.categoryCard,
					isSelected && styles.selected,
					category.isStatic && styles.staticCard,
				)}
				onClick={e => {
					// Don't trigger if click was on menu container or menu button
					const menuContainer = e.target.closest('[data-menu-container]')
					const menuButton = e.target.closest('button[class*="menuButton"]')
					if (menuContainer || menuButton) {
						e.stopPropagation()
						return
					}
					if (hasChildren) {
						onToggleCategory(category.id)
					} else {
						onSelectCategory(category.id)
					}
				}}
				onMouseDown={e => {
					// Prevent event bubbling for menu interactions
					const menuContainer = e.target.closest('[data-menu-container]')
					const menuButton = e.target.closest('button[class*="menuButton"]')
					if (menuContainer || menuButton) {
						e.stopPropagation()
					}
				}}
				style={
					level === 0
						? {
								'--category-animation': `fadeSlideUp 0.3s ease-out ${categoryIndex * 0.06}s backwards`,
							}
						: {
								'--child-animation': isClosing
									? `fadeSlideOut 0.15s ease-in ${categoryIndex * 0.03}s backwards`
									: `fadeSlideUp 0.2s ease-out ${categoryIndex * 0.05}s backwards`,
							}
				}
			>
				{hasChildren && (
					<div className={styles.expandIcon}>
						<svg
							className={styles.expandIconHorizontal}
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth='2.5'
						>
							<path strokeLinecap='round' strokeLinejoin='round' d='M20 12H4' />
						</svg>
						<svg
							className={cn(
								styles.expandIconVertical,
								isExpanded ? styles.expanded : styles.collapsed,
							)}
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
							strokeWidth='2.5'
						>
							<path strokeLinecap='round' strokeLinejoin='round' d='M12 20V4' />
						</svg>
					</div>
				)}

				{!hasChildren && level > 0 && (
					<span style={{ width: '0.75rem', display: 'inline-block' }} />
				)}

				<span className={styles.categoryName}>{category.name}</span>

				{category.badge && (
					<span className={level === 0 ? styles.categoryBadge : styles.categoryBadgeColored}>
						{category.badge}
					</span>
				)}

				{category.hasLock && (
					<svg
						className={styles.lockIcon}
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						strokeWidth='2'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
						/>
					</svg>
				)}

				{category.hasMenu && (
					<div data-menu-container style={{ marginLeft: 'auto', flexShrink: 0 }}>
						<CategoryMenu
							category={category}
							onEdit={onEditCategory}
							onDelete={onDeleteCategory}
							onAddChild={onAddChild}
						/>
					</div>
				)}
			</div>

			{/* Children - recursively render */}
			{hasChildren && (isExpanded || isClosing) && (
				<div
					className={cn(styles.childrenContainer, isClosing ? styles.collapsing : styles.expanding)}
				>
					<div className={styles.childrenInner}>
						{category.children.map((child, childIndex) => (
							<CategoryTreeItem
								key={`${currentPath}/${childIndex}/${child.id}`}
								category={child}
								level={level + 1}
								categoryIndex={childIndex}
								expandedCategories={expandedCategories}
								closingCategories={closingCategories}
								selectedCategory={selectedCategory}
								onToggleCategory={onToggleCategory}
								onSelectCategory={onSelectCategory}
								onEditCategory={onEditCategory}
								onDeleteCategory={onDeleteCategory}
								onAddChild={onAddChild}
								styles={styles}
								cn={cn}
								isLast={childIndex === category.children.length - 1 && !child.children}
								parentPath={currentPath}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	)
}

export default function TransactionCategoriesPage() {
	const [activeTab, setActiveTab] = useState('income')
	const [expandedCategories, setExpandedCategories] = useState([])
	const [closingCategories, setClosingCategories] = useState([])
	const [selectedCategory, setSelectedCategory] = useState(null)
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [categoryToEdit, setCategoryToEdit] = useState(null)
	const [categoryToDelete, setCategoryToDelete] = useState(null)
	const [searchQuery, setSearchQuery] = useState('')

	const deleteMutation = useDeleteChartOfAccounts()

	const toggleCategory = id => {
		if (expandedCategories.includes(id)) {
			// Find all children that are also expanded
			const findAllChildren = parentId => {
				const children = []
				const parent = categories.find(c => c.id === parentId)
				if (parent?.children) {
					parent.children.forEach(child => {
						if (expandedCategories.includes(child.id)) {
							children.push(child.id)
							if (child.children) {
								children.push(...findAllChildren(child.id))
							}
						}
					})
				}
				return children
			}

			const allToClose = [id, ...findAllChildren(id)]

			// Start closing animation for parent and all children
			setClosingCategories(prev => [...prev, ...allToClose])
			setTimeout(() => {
				setExpandedCategories(prev => prev.filter(cid => !allToClose.includes(cid)))
				setClosingCategories(prev => prev.filter(cid => !allToClose.includes(cid)))
			}, 250) // Match animation duration (0.25s)
		} else {
			setExpandedCategories(prev => [...prev, id])
		}
	}

	const tabs = [
		{ key: 'income', label: 'Доходы' },
		{ key: 'expense', label: 'Расходы' },
		{ key: 'assets', label: 'Актив' },
		{ key: 'liabilities', label: 'Обязательства' },
		{ key: 'capital', label: 'Капитал' },
	]

	// Map tab keys to root category names from API
	const tabToRootNameMap = useMemo(
		() => ({
			income: 'Доходы',
			expense: 'Расходы',
			assets: 'Актив',
			liabilities: 'Обязательства',
			capital: 'Капитал',
		}),
		[],
	)

	const {
		data: chartOfAccountsData,
		isLoading: isLoadingChartOfAccounts,
		error: chartOfAccountsError,
	} = useChartOfAccountsPlanFact({
		page: 1,
		limit: 100,
		search: searchQuery.trim() || undefined, // Передаем search только если есть значение
	})

	const isLoadingChartOfAccountsV2 = isLoadingChartOfAccounts
	const chartOfAccountsErrorV2 = chartOfAccountsError
 
	const chartOfAccountsTree = useMemo(() => {
		return chartOfAccountsData?.data?.data?.data || []
	}, [chartOfAccountsData])

	// Get the root node for active tab and convert its children to display format
	const categories = useMemo(() => {
		if (!Array.isArray(chartOfAccountsTree) || chartOfAccountsTree.length === 0) {
			return []
		}

		const rootName = tabToRootNameMap[activeTab]
		if (!rootName) return []

		// Find the root node for this tab (e.g., "Доходы", "Расходы")
		const rootNode = chartOfAccountsTree.find(node => node.nazvanie === rootName)
		if (!rootNode || !rootNode.children) {
			return []
		}

		// Recursively convert API structure to display format
		const convertToCategory = (node, level = 0) => {
			const isStatic = node.static === true
			
			const category = {
				id: node.guid || `temp-${node.nazvanie}-${level}`,
				guid: node.guid,
				name: node.nazvanie,
				hasMenu: !!node.guid, // Only show menu if item has guid
				hasLock: isStatic,
				isStatic: isStatic,
				children: node.children ? node.children.map(child => convertToCategory(child, level + 1)) : undefined,
				balans: node.balans,
				komentariy: node.komentariy,
				tip: node.tip,
				tip_operatsii: node.tip_operatsii,
				chart_of_accounts_id_2: node.chart_of_accounts_id_2,
				level: level,
			}

			return category
		}

		// Return children of root node (hide root itself as per documentation)
		return rootNode.children.map(child => convertToCategory(child, 0))
	}, [chartOfAccountsTree, activeTab, tabToRootNameMap])

	const handleTabChange = tabKey => {
		setActiveTab(tabKey)
		setExpandedCategories([])
		setClosingCategories([])
		setSelectedCategory(null)
		setSearchQuery('') // Clear search when changing tabs
	}

	return (
		<div className={styles.container}>
			<div className={styles.content}>
				{/* Header */}
				<div className={styles.header}>
					<div className={styles.headerTop}>
						<div className={styles.headerLeft}>
							<h1 className={styles.title}>Учетные статьи</h1>
							<button onClick={() => setIsCreateModalOpen(true)} className={styles.createButton}>
								Создать
							</button>
						</div>
						<div className={styles.searchContainer}>
							<input 
								type='text' 
								placeholder='Поиск по названию' 
								className={styles.searchInput}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<svg
								className={styles.searchIcon}
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<circle cx='11' cy='11' r='8'></circle>
								<path d='m21 21-4.35-4.35'></path>
							</svg>
						</div>
					</div>

					<div className={styles.tabsContainer}>
						{tabs.map((tab, index) => (
							<button
								key={tab.key}
								onClick={() => handleTabChange(tab.key)}
								className={cn(
									styles.tab,
									index === 0 && styles.first,
									index === tabs.length - 1 && styles.last,
									index > 0 && styles.notFirst,
									activeTab === tab.key ? styles.active : styles.inactive,
								)}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{/* Content */}
				<div className={styles.contentArea}>
					{/* Left Sidebar - Category Tree */}
					<div className={styles.sidebar}>
						<div className={styles.sidebarContent} key={activeTab}>
							{isLoadingChartOfAccountsV2 && (
								<div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>
							)}
							{chartOfAccountsErrorV2 && (
								<div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
									Ошибка: {chartOfAccountsErrorV2.message || 'Не удалось загрузить данные'}
								</div>
							)}
							{!isLoadingChartOfAccountsV2 &&
								!chartOfAccountsErrorV2 &&
								categories.length === 0 && (
									<div className={styles.emptyState}>
										{searchQuery ? 'Ничего не найдено' : 'Нет данных для отображения'}
									</div>
								)}
							{categories.map((category, categoryIndex) => (
								<CategoryTreeItem
									key={`${activeTab}/${categoryIndex}/${category.id}`}
									category={category}
									level={0}
									categoryIndex={categoryIndex}
									expandedCategories={expandedCategories}
									closingCategories={closingCategories}
									selectedCategory={selectedCategory}
									onToggleCategory={toggleCategory}
									onSelectCategory={setSelectedCategory}
									onEditCategory={cat => {
										setCategoryToEdit(cat)
										setIsEditModalOpen(true)
									}}
									onDeleteCategory={cat => {
										setCategoryToDelete(cat)
										setIsDeleteModalOpen(true)
									}}
									onAddChild={cat => {
										setCategoryToEdit(cat)
										setIsCreateModalOpen(true)
									}}
									styles={styles}
									cn={cn}
									isLast={categoryIndex === categories.length - 1}
									parentPath={activeTab}
								/>
							))}
						</div>
					</div>

					{/* Right Content - Cards */}
					<div className={styles.rightContent}>
						<div className={styles.rightContentInner}>
							<p className={styles.description}>
								Эта схема наглядно показывает, как статьи участвуют в формировании отчета Баланс
							</p>

							<div className={styles.cardsGrid}>
								{/* Left Column - 2 cards vertically */}
								<div className={styles.leftColumn}>
									<div className={styles.cardsSpacing}>
										{/* Движение денег */}
										<div className={styles.card}>
											<h3 className={styles.cardHeader}>Движение денег</h3>

											<div className={styles.cardContent}>
												<div className={styles.section}>
													<div className={styles.sectionHeader}>Операционный поток</div>
													<div className={styles.sectionItems}>
														<div className={styles.sectionItem}>Поступления</div>
														<div className={styles.sectionItem}>Выплаты</div>
													</div>
												</div>

												<div className={cn(styles.section, styles.sectionDivider)}>
													<div className={styles.sectionHeader}>Инвестиционный поток</div>
													<div className={styles.sectionItems}>
														<div className={styles.sectionItem}>Поступления</div>
														<div className={styles.sectionItem}>Выплаты</div>
													</div>
												</div>

												<div className={cn(styles.section, styles.sectionDivider)}>
													<div className={styles.sectionHeader}>Финансовый поток</div>
													<div className={styles.sectionItems}>
														<div className={styles.sectionItem}>Поступления</div>
														<div className={styles.sectionItem}>Выплаты</div>
													</div>
												</div>

												<div className={cn(styles.section, styles.sectionDividerBold)}>
													<div className={styles.sectionTotal}>ОБЩИЙ ДЕНЕЖНЫЙ ПОТОК</div>
												</div>
											</div>
										</div>

										{/* Прибыли и убытки */}
										<div className={styles.card}>
											<h3 className={styles.cardHeader}>Прибыли и убытки</h3>

											<div className={styles.cardContent}>
												<div className={styles.section}>
													<div className={styles.sectionHeader}>
														<span>Доходы</span>
														<span className={styles.badge}>0</span>
													</div>
													<div className={styles.sectionItems}>
														<div className={styles.sectionItem}>Продажа товаров</div>
														<div className={styles.sectionItem}>Оказание услуг</div>
														<div className={styles.sectionItem}>Прочие доходы</div>
													</div>
												</div>

												<div className={cn(styles.section, styles.sectionDivider)}>
													<div className={styles.sectionHeader}>
														<div className={styles.sectionHeaderWithIcon}>
															<span className={styles.sectionHeaderText}>минус</span>
															<span>Расходы</span>
														</div>
														<span className={styles.badge}>0</span>
													</div>
													<div className={styles.sectionItems}>
														<div className={styles.sectionItem}>Производственный персонал</div>
														<div className={styles.sectionItem}>Покупка товаров</div>
														<div className={styles.sectionItem}>Административный персонал</div>
														<div className={styles.sectionItem}>Аренда</div>
														<div className={styles.sectionItem}>Прочие расходы</div>
														<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
															Банковские услуги
														</div>
														<div
															className={cn(
																styles.sectionItem,
																styles.sectionItemNested,
																styles.sectionItemWithBadge,
															)}
														>
															<span className={styles.badgeSoon}>скоро</span>
															<span>Курсовая разница минус</span>
														</div>
														<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
															Амортизация
														</div>
														<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
															Проценты
														</div>
														<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
															Налог на прибыль (доходы)
														</div>
													</div>
												</div>

												<div className={cn(styles.section, styles.sectionDividerBold)}>
													<div className={styles.sectionTotal}>НЕРАСПРЕДЕЛЕННАЯ ПРИБЫЛЬ</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Right Column - 1 big card */}
								<div className={styles.rightColumn}>
									{/* Баланс */}
									<div className={cn(styles.card, styles.cardFullHeight)}>
										<h3 className={styles.cardHeader}>Баланс</h3>

										<div className={styles.cardContent}>
											<div className={styles.section}>
												<div className={styles.sectionHeader}>
													<span>Оборотные активы</span>
													<span className={styles.badge}>0</span>
												</div>
												<div className={styles.sectionItems}>
													<div className={styles.sectionItem}>Дебиторская задолженность</div>
													<div className={styles.sectionItem}>Денежные средства</div>
													<div className={styles.sectionItem}>Запасы</div>
													<div className={styles.sectionItem}>Другие оборотные</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Заготовые платежи
													</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Выданные займы (до 1 года)
													</div>
												</div>
											</div>

											<div className={cn(styles.section, styles.sectionDivider)}>
												<div className={styles.sectionHeader}>
													<div className={styles.sectionHeaderWithIcon}>
														<span>Внеоборотные активы</span>
														<span className={styles.badgeDark}>И</span>
													</div>
												</div>
												<div className={styles.sectionItems}>
													<div className={styles.sectionItem}>Основные средства</div>
													<div className={styles.sectionItem}>Оборудование</div>
													<div className={styles.sectionItem}>Транспорт</div>
													<div className={styles.sectionItem}>Другие внеоборотные</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Выданные займы (от 1 года)
													</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Финансовые вложения
													</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Нематериальные активы
													</div>
												</div>
											</div>

											<div className={cn(styles.section, styles.sectionDividerBold)}>
												<div className={styles.sectionTotal}>ИТОГО АКТИВЫ</div>
											</div>

											<div className={cn(styles.section, styles.sectionDivider)}>
												<div className={styles.sectionHeader}>
													<span>Краткосрочные обязательства</span>
													<span className={styles.badge}>0</span>
												</div>
												<div className={styles.sectionItems}>
													<div className={styles.sectionItem}>Кредиторская задолженность</div>
													<div className={styles.sectionItem}>Другие краткосрочные</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Платежи третьим лицам
													</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Полученные займы (до 1 года)
													</div>
												</div>
											</div>

											<div className={cn(styles.section, styles.sectionDivider)}>
												<div className={styles.sectionHeader}>
													<div className={styles.sectionHeaderWithIcon}>
														<span>Долгосрочные обязательства</span>
														<span className={styles.badgePrimary}>Ф</span>
													</div>
												</div>
												<div className={styles.sectionItems}>
													<div className={styles.sectionItem}>Кредиты</div>
													<div className={styles.sectionItem}>Другие долгосрочные</div>
													<div className={cn(styles.sectionItem, styles.sectionItemNested)}>
														Полученные займы (от 1 года)
													</div>
												</div>
											</div>

											<div className={cn(styles.section, styles.sectionDividerBold)}>
												<div className={styles.sectionTotal}>ИТОГО ОБЯЗАТЕЛЬСТВА</div>
											</div>

											<div className={cn(styles.section, styles.sectionDivider)}>
												<div className={styles.sectionHeader}>
													<div className={styles.sectionHeaderWithIcon}>
														<span>Капитал</span>
														<span className={styles.badgePrimary}>Ф</span>
													</div>
												</div>
												<div className={styles.sectionItems}>
													<div className={styles.sectionItem}>Вложения учредителей</div>
													<div className={cn(styles.sectionItem, styles.sectionItemWithBadge)}>
														<span className={styles.sectionTotalTextGreen}>плюс</span>
														<span>Нераспределенная прибыль</span>
													</div>
												</div>
											</div>

											<div className={cn(styles.section, styles.sectionDividerBold)}>
												<div className={styles.sectionTotal}>ИТОГО КАПИТАЛ</div>
											</div>

											<div className={cn(styles.section, styles.sectionDividerExtraBold)}>
												<div className={styles.sectionTotal}>АКТИВЫ = ОБЯЗАТЕЛЬСТВА + КАПИТАЛ</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Create Modal */}
			<CreateChartOfAccountsModal
				isOpen={isCreateModalOpen}
				onClose={() => {
					setIsCreateModalOpen(false)
					setCategoryToEdit(null)
				}}
				initialTab={activeTab}
				parentCategory={categoryToEdit}
			/>

			{/* Edit Modal */}
			<EditChartOfAccountsModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false)
					setCategoryToEdit(null)
				}}
				category={categoryToEdit}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteCategoryConfirmModal
				isOpen={isDeleteModalOpen}
				category={categoryToDelete}
				onConfirm={async () => {
					if (categoryToDelete?.guid) {
						try {
							await deleteMutation.mutateAsync({ guid: categoryToDelete.guid })
							showSuccessNotification('Учетная статья успешно удалена!')
							setIsDeleteModalOpen(false)
							setCategoryToDelete(null)
						} catch (error) {
							console.error('Error deleting category:', error)
							showErrorNotification(error.message || 'Не удалось удалить учетную статью')
						}
					}
				}}
				onCancel={() => {
					setIsDeleteModalOpen(false)
					setCategoryToDelete(null)
				}}
				isDeleting={deleteMutation.isPending}
			/>
		</div>
	)
}
