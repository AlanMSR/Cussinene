import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Edit, Trash2, Search, Keyboard, ScanBarcode, Mic, SquarePen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ManuallyPopup from '@/components/ManuallyPopup';
import ScannedItemPopup from '@/components/ScannedItemPopup';
import BarcodeScanner from '@/components/BarcodeScanner';
import { useUser } from '@/contexts/UserContext';
import { useInventory } from '@/contexts/InventoryContext';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import DeletePopup from '@/components/DeletePopup';
import EditPopup from '@/components/EditPopup';
import LoadingScreen from '@/components/LoadingScreen';
import VoicePopup from '@/components/VoicePopup';
import { useTextSize } from '@/contexts/TextSizeContext';

const client = generateClient<Schema>();

const formatUnitType = (unit: string) => {
  return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase();
};

export default function InventoryScreen() {
  const { colors } = useTheme();
  const { getFontSize } = useTextSize();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isManualPopupVisible, setManualPopupVisible] = useState(false);
  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Record<string, any> | null>(null);
  const [editPopupVisible, setEditPopupVisible] = useState(false);
  const [editItem, setEditItem] = useState<Record<string, any> | null>(null);
  const [unitTypes, setUnitTypes] = useState<string[]>([]);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [isScannedPopupVisible, setScannedPopupVisible] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<{
    name: string;
    quantity?: string;
    unit?: string;
  } | null>(null);
  const [isVoicePopupVisible, setVoicePopupVisible] = useState(false);

  const { user } = useUser();
  const { inventory, loading: inventoryLoading, fetchInventory, deleteInventoryItem } = useInventory();

  useEffect(() => {
    if (user?.sub) fetchInventory(user.sub);
  }, [user, fetchInventory]);

  useEffect(() => {
    const fetchUnitTypes = async () => {
      try {
        const { enums } = client;
        if (enums && enums.UnitType) {
          setUnitTypes(enums.UnitType.values());
        }
      } catch (e) {
        setUnitTypes([]);
      }
    };
    fetchUnitTypes();
  }, []);

  const handleItemAdded = async () => {
    if (user?.sub) {
      await fetchInventory(user.sub);
    }
  };

  const handleDeletePress = (item: Record<string, any>) => {
    setSelectedItem(item);
    setDeletePopupVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItem?.id) {
      await deleteInventoryItem(selectedItem.id);
    }
    setDeletePopupVisible(false);
    setSelectedItem(null);
  };

  const handleEditPress = (item: Record<string, any>) => {
    setEditItem(item);
    setEditPopupVisible(true);
  };
  console.log('inventory: ', inventory);

  const handleEditSave = async (updated: { id: string; name: string; quantity: string; unit: string }) => {
    await client.models.Inventory.update({
      id: updated.id,
      name: updated.name,
      quantity: parseFloat(updated.quantity),
      unit: updated.unit as Schema["Inventory"]["type"]["unit"],
    });
    if (user?.sub) {
      await fetchInventory(user.sub);
    }
    setEditPopupVisible(false);
    setEditItem(null);
  };

  const handleProductScanned = async (product: { name: string; quantity?: string; unit?: string }) => {
    setScannerVisible(false);
    setScannedProduct(product);
    setScannedPopupVisible(true);
  };

  const handleVoiceIngredients = async (ingredients: Array<{ name: string; quantity: number; unit: string }>) => {
    if (!user?.sub) return;
    
    // Add each ingredient to the inventory
    for (const ingredient of ingredients) {
      await client.models.Inventory.create({
        userId: user.sub,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit as Schema['Inventory']['type']['unit'],
      });
    }
    
    // Refresh the inventory
    await fetchInventory(user.sub);
    setVoicePopupVisible(false);
  };

  const filteredInventory = inventory.filter((item: Record<string, any>) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }: { item: Record<string, any> }) => (
    <View style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.itemInfo}>
        <Text 
          style={[styles.itemName, { color: colors.textPrimary, fontSize: getFontSize(17) }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        <Text style={[styles.itemQuantity, { color: colors.textSecondary, fontSize: getFontSize(14) }]}>
          Quantity: {item.quantity}{item.unit ? ` ${formatUnitType(item.unit)}` : ''}
        </Text>
      </View>
      <View style={styles.itemActions}>
        {/* <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.accent }]} onPress={() => handleEditPress(item)}>
          <Text style={[styles.editButtonText, { color: colors.textWhite, fontSize: getFontSize(15) }]}>Edit</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.editButton} onPress={() => handleEditPress(item)}>
          <SquarePen size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePress(item)}>
          <Trash2 size={22} color={colors.warning} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isScannerVisible) {
    return (
      <BarcodeScanner
        onClose={() => setScannerVisible(false)}
        onProductFound={handleProductScanned}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Inventory',
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')} style={{ paddingRight: 15 }}>
              <Settings size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.textPrimary, fontSize: 20 },
        }}
      />

      {/* Action Buttons */}
      <View style={[styles.actionsRow, { borderColor: colors.divider }]}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setManualPopupVisible(true)}>
          <Keyboard size={28} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary, fontSize: getFontSize(15) }]}>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setScannerVisible(true)}>
          <ScanBarcode size={28} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary, fontSize: getFontSize(15) }]}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setVoicePopupVisible(true)}>
          <Mic size={28} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary, fontSize: getFontSize(15) }]}>Voice</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
        <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary, fontSize: getFontSize(16) }]}
          placeholder="Search items..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredInventory}
        keyExtractor={(item: Record<string, any>) => item?.id?.toString() || item?._id?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={{ flex: 1 }}
        refreshing={inventoryLoading}
        onRefresh={() => { if (user?.sub) fetchInventory(user.sub); }}
      />

      <ManuallyPopup
        visible={isManualPopupVisible}
        onClose={() => setManualPopupVisible(false)}
        onSave={handleItemAdded}
        userAttributes={user}
      />

      {scannedProduct && (
        <ScannedItemPopup
          visible={isScannedPopupVisible}
          onClose={() => {
            setScannedPopupVisible(false);
            setScannedProduct(null);
          }}
          onSave={handleItemAdded}
          userAttributes={user}
          scannedProduct={scannedProduct}
        />
      )}

      <DeletePopup
        visible={deletePopupVisible}
        onClose={() => {
          setDeletePopupVisible(false);
          setSelectedItem(null);
        }}
        onDelete={handleConfirmDelete}
        itemName={selectedItem?.name || ''}
      />

      <EditPopup
        visible={editPopupVisible}
        onClose={() => {
          setEditPopupVisible(false);
          setEditItem(null);
        }}
        onSave={handleEditSave}
        item={editItem as { id: string; name: string; quantity: string; unit: string } | null}
        unitTypes={unitTypes}
      />

      <VoicePopup
        visible={isVoicePopupVisible}
        onClose={() => setVoicePopupVisible(false)}
        onSaveIngredients={handleVoiceIngredients}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 2,
    marginBottom: 0,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionLabel: {
    marginTop: 4,
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
  },
  listContent: {
    padding: 12,
    paddingBottom: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontWeight: '600',
  },
  itemQuantity: {
    marginTop: 2,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  editButtonText: {
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 8,
  },
}); 