import React, { useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useFavoriteRecipes } from '@/contexts/FavoriteRecipesContext';
import RecipeCard from '@/components/RecipeCard';

export default function GenerateRecipesScreen() {
    const isLoading = false;
    const error = null;
    const { favoriteRecipes, fetchFavoriteRecipes } = useFavoriteRecipes();
    const recipes = [1, 2];
    const { colors } = useTheme()

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchFavoriteRecipes();
            } catch (err) {
                console.error('Error fetching favorite recipes:', err);
            }
        };

        fetchData();

        return () => {
            // Cleanup if needed
        };
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Stack.Screen
                options={{
                    title: 'Recipes',
                    headerShown: true,
                    headerStyle: { backgroundColor: colors.surface },
                    headerShadowVisible: false,
                }}
            />
            <StatusBar style="dark" />

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textPrimary, marginTop: 16 }}>
                        Generating recipes...
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={{ color: colors.warning, marginBottom: 16 }}>
                        Something went wrong
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.retryButtonText, { color: colors.textWhite }]}>
                            Go Back
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : favoriteRecipes.length > 0 ? (
                <ScrollView contentContainerStyle={styles.recipesContainer}>
                    {favoriteRecipes.map((fav, index) => (
                        <RecipeCard
                            key={fav.id}
                            recipe={{
                                title: fav.name,
                                mealType: fav.mealType ?? null,
                                cookingTime: fav.cookTime,
                                ingredients: fav.ingredients.map((ing, i) => ({
                                    id: "non-id",
                                    name: ing.name,
                                    quantity: ing.quantity,
                                    unit: ing.unit,
                                })),
                                instructions: fav.steps,
                            }}
                            recipeId={fav.id}
                        />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>
                        No recipes
                    </Text>
                    <TouchableOpacity
                        style={[styles.generateButton, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.generateButtonText, { color: colors.textWhite }]}>
                            Go back
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recipesContainer: {
        padding: 16,
        gap: 16,
    },
    generateButton: {
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryButton: {
        padding: 12,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 120,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
});
