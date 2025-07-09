
import { useTranslation } from 'react-i18next';
import { InventoryItem } from '@/store/inventoryStore';

export const useTranslatedInventory = () => {
  const { t } = useTranslation();

  const translateItem = (item: InventoryItem): InventoryItem => {
    // Map of item IDs to translation keys
    const itemTranslations: Record<string, string> = {
      '1': 'premiumCoffeeBeans',
      '2': 'organicHoney', 
      '3': 'handmadeSoap'
    };

    // Map of categories to translation keys
    const categoryTranslations: Record<string, string> = {
      'Food & Beverage': 'food',
      'Health & Beauty': 'health',
      'Electronics': 'electronics',
      'Clothing': 'clothing'
    };

    const translationKey = itemTranslations[item.id];
    const categoryKey = categoryTranslations[item.category];

    return {
      ...item,
      name: translationKey ? t(`inventoryItems.${translationKey}.name`) : item.name,
      description: translationKey ? t(`inventoryItems.${translationKey}.description`) : item.description,
      category: categoryKey ? t(`inventoryItems.categories.${categoryKey}`) : item.category
    };
  };

  const translateItems = (items: InventoryItem[]): InventoryItem[] => {
    return items.map(translateItem);
  };

  const translateCategories = (categories: string[]): string[] => {
    const categoryTranslations: Record<string, string> = {
      'Food & Beverage': 'food',
      'Health & Beauty': 'health',
      'Electronics': 'electronics',
      'Clothing': 'clothing'
    };

    return categories.map(category => {
      const key = categoryTranslations[category];
      return key ? t(`inventoryItems.categories.${key}`) : category;
    });
  };

  return {
    translateItem,
    translateItems,
    translateCategories
  };
};
