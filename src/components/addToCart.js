export const addToCart = async (userId, productId, quantity) => {
    const { data, error } = await supabase
        .from('cart_product')  // 'cart' is the table name in Supabase
        .insert([
            { user_id: userId, product_id: productId, quantity }  // Insert values into cart
        ]);

    if (error) {
        console.error('Error adding to cart:', error);
        return { success: false, message: 'Failed to add to cart' };
    } else {
        console.log('Item added to cart:', data);
        return { success: true, message: 'Added to cart successfully!' };
    }
};
