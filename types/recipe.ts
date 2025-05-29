export interface Ingredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
}

export interface Recipe {
    title: string;
    mealType: string | null;
    ingredients: Ingredient[];
    instructions: string[];
    cookingTime: number;
}