import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      // Each item: { id, attractionId, name, image, price, quantity, scheduleId, date, time, modalidad }

      addItem: (item) => {
        const existing = get().items.find(
          (i) => i.attractionId === item.attractionId && i.scheduleId === item.scheduleId
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.attractionId === item.attractionId && i.scheduleId === item.scheduleId
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: item.quantity || 1 }] });
        }
      },

      removeItem: (attractionId, scheduleId) => {
        set({
          items: get().items.filter(
            (i) => !(i.attractionId === attractionId && i.scheduleId === scheduleId)
          ),
        });
      },

      updateQuantity: (attractionId, scheduleId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(attractionId, scheduleId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.attractionId === attractionId && i.scheduleId === scheduleId
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      count: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);

export default useCartStore;
