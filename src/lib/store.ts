import { create } from 'zustand';
import { Booking, Branch, IncomingParcel, User, Role } from './types';

interface BranchState {
    currentBranch: Branch;
    branches: Branch[]; // List of available branches
    bookings: Booking[];
    incomingParcels: IncomingParcel[];
    searchQuery: string;

    // Auth State
    currentUser: User | null;
    users: User[];

    // Actions
    setBranch: (branch: Branch) => void;
    addBranch: (branch: Branch) => void;
    removeBranch: (branch: Branch) => void;
    addBooking: (booking: Booking) => void;
    setSearchQuery: (query: string) => void;
    markParcelReceived: (id: string) => void;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (id: string) => void;
    resetPassword: (id: string) => void;
    updateBooking: (booking: Booking) => void;
    cancelBooking: (id: string) => void;
}

const MOCK_USERS: User[] = [
    { id: "1", name: "Super Admin", username: "admin", role: "SUPER_ADMIN", password: "password", allowedBranches: [], allowedReports: [], isActive: true },
    // Surat
    { id: "2", name: "Hirabagh Manager", username: "hirabagh", role: "ADMIN", branch: "Hirabagh (HO)", password: "password", allowedBranches: ["Hirabagh (HO)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "3", name: "Katargam Manager", username: "katargam", role: "ADMIN", branch: "Katargam (KA)", password: "password", allowedBranches: ["Katargam (KA)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "4", name: "Sahara Manager", username: "sahara", role: "ADMIN", branch: "Sahara Darvaja (SA)", password: "password", allowedBranches: ["Sahara Darvaja (SA)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    // Ahmedabad
    { id: "5", name: "Amdavad Manager", username: "amdavad-ctm", role: "ADMIN", branch: "Amdavad (CTM)", password: "password", allowedBranches: ["Amdavad (CTM)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "6", name: "Bapunagar Manager", username: "bapunagar", role: "ADMIN", branch: "Bapunagar (BA)", password: "password", allowedBranches: ["Bapunagar (BA)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "7", name: "Paldi Manager", username: "paldi", role: "ADMIN", branch: "Paldi (PA)", password: "password", allowedBranches: ["Paldi (PA)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "8", name: "Setelite Manager", username: "setelite", role: "ADMIN", branch: "Setelite (SET)", password: "password", allowedBranches: ["Setelite (SET)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    // Mumbai
    { id: "9", name: "Borivali Manager", username: "mumbai-borivali", role: "ADMIN", branch: "Mumbai Borivali (BO)", password: "password", allowedBranches: ["Mumbai Borivali (BO)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "10", name: "Vasai Manager", username: "mumbai-vasai", role: "ADMIN", branch: "Mumbai Vasai (VA)", password: "password", allowedBranches: ["Mumbai Vasai (VA)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "11", name: "Andheri Manager", username: "mumbai-andheri", role: "ADMIN", branch: "Mumbai Andheri (AN)", password: "password", allowedBranches: ["Mumbai Andheri (AN)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    // Rajkot
    { id: "12", name: "Punitnagar Manager", username: "rajkot-punitnagar", role: "ADMIN", branch: "Rajkot Punitnagar (PU)", password: "password", allowedBranches: ["Rajkot Punitnagar (PU)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
    { id: "13", name: "Limdachok Manager", username: "rajkot-limdachok", role: "ADMIN", branch: "Rajkot Limdachok (LI)", password: "password", allowedBranches: ["Rajkot Limdachok (LI)"], allowedReports: ["Daily", "Revenue", "Branch-wise", "Payment", "Sender/Receiver"], isActive: true },
];

// Helper to generate distributed mock data
const generateMockBookings = (): Booking[] => {
    const branches = [
        "Hirabagh (HO)", "Katargam (KA)", "Sahara Darvaja (SA)",
        "Amdavad (CTM)", "Bapunagar (BA)", "Paldi (PA)", "Setelite (SET)",
        "Mumbai Borivali (BO)", "Mumbai Vasai (VA)", "Mumbai Andheri (AN)",
        "Rajkot Punitnagar (PU)", "Rajkot Limdachok (LI)"
    ];

    const bookings: Booking[] = [];
    // Weighted statuses: More 'Delivered' and 'Booked' than 'Cancelled'
    const statusWeights = [
        { value: "Booked", weight: 30 },
        { value: "In Transit", weight: 25 },
        { value: "Arrived", weight: 20 },
        { value: "Delivered", weight: 20 },
        { value: "Cancelled", weight: 5 }
    ];

    const getWeightedStatus = () => {
        const rand = Math.random() * 100;
        let sum = 0;
        for (const s of statusWeights) {
            sum += s.weight;
            if (rand < sum) return s.value;
        }
        return "Booked";
    };

    const paymentStatuses: any[] = ["Paid", "To Pay"];

    // Generate ~500 bookings for better data density
    for (let i = 1; i <= 500; i++) {
        const fromBranch = branches[Math.floor(Math.random() * branches.length)];
        let toBranch = branches[Math.floor(Math.random() * branches.length)];
        while (toBranch === fromBranch) toBranch = branches[Math.floor(Math.random() * branches.length)];

        const date = new Date();
        // Spread over last 60 days
        date.setDate(date.getDate() - Math.floor(Math.random() * 60));

        // Create varying costs
        const rate = 100 + Math.floor(Math.random() * 50); // 100-150
        const weight = Math.floor(Math.random() * 50) + 5; // 5-55
        const quantity = Math.floor(Math.random() * 5) + 1; // 1-6

        const freight = Math.round(weight * rate * (Math.random() * 0.2 + 0.9)); // Random variance
        const handling = 50;
        const hamali = 20 * quantity;
        const total = freight + handling + hamali;

        bookings.push({
            id: i.toString(),
            lrNumber: `LR${20240000 + i}`,
            date: date.toISOString().split('T')[0],
            fromBranch: fromBranch as any,
            toBranch: toBranch as any,
            sender: { name: `Sender ${i}`, mobile: `9${Math.floor(Math.random() * 1000000000)}`, email: `sender${i}@example.com` },
            receiver: { name: `Receiver ${i}`, mobile: `8${Math.floor(Math.random() * 1000000000)}`, email: `receiver${i}@example.com` },
            parcels: [{ id: `p${i}`, quantity, itemType: "Carton", weight, rate }],
            costs: { freight, handling, hamali, total },
            paymentType: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
            status: getWeightedStatus() as any,
        });
    }
    // Sort by date descending
    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateMockIncoming = (): IncomingParcel[] => {
    // Generate some incoming parcels
    return Array.from({ length: 15 }).map((_, i) => ({
        id: `INC${i}`,
        lrNumber: `LR9${900 + i}`,
        senderName: `Incoming Sender ${i}`,
        receiverName: `Incoming Receiver ${i}`,
        fromBranch: "Mumbai Borivali (BO)",
        toBranch: "Hirabagh (HO)",
        status: "In Transit",
        paymentStatus: "To Pay",
        totalAmount: 1200 + i * 100
    }));
};

export const useBranchStore = create<BranchState>((set, get) => ({
    currentBranch: "Hirabagh (HO)", // Default to HO
    bookings: generateMockBookings(),
    incomingParcels: generateMockIncoming(),
    searchQuery: "",

    // Auth Init
    currentUser: null,
    users: MOCK_USERS,

    branches: [
        "Hirabagh (HO)", "Katargam (KA)", "Sahara Darvaja (SA)",
        "Amdavad (CTM)", "Bapunagar (BA)", "Paldi (PA)", "Setelite (SET)",
        "Mumbai Borivali (BO)", "Mumbai Vasai (VA)", "Mumbai Andheri (AN)",
        "Rajkot Punitnagar (PU)", "Rajkot Limdachok (LI)"
    ],

    setBranch: (branch) => set({ currentBranch: branch }),

    addBranch: (branch) => set((state) => ({ branches: [...state.branches, branch] })),

    removeBranch: (branch) => set((state) => ({
        branches: state.branches.filter(b => b !== branch),
        // If current branch is deleted, switch to first available or empty
        currentBranch: state.currentBranch === branch ? (state.branches.filter(b => b !== branch)[0] || "") : state.currentBranch
    })),

    addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
    })),

    setSearchQuery: (query) => set({ searchQuery: query }),

    markParcelReceived: (id) => set((state) => ({
        incomingParcels: state.incomingParcels.map(p =>
            p.id === id ? { ...p, status: "Arrived" } : p
        )
    })),

    login: (username, password) => {
        const state = get();
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
            set({ currentUser: user });
            return true;
        }
        return false;
    },

    logout: () => set({ currentUser: null }),


    addUser: (user) => set((state) => ({
        users: [...state.users,
        {
            ...user,
            allowedBranches: user.allowedBranches || [],
            allowedReports: user.allowedReports || [],
            isActive: user.isActive ?? true
        }
        ]
    })),

    updateUser: (updatedUser) => set((state) => {
        const newUsers = state.users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u);
        const currentUser = state.currentUser?.id === updatedUser.id ? { ...state.currentUser, ...updatedUser } : state.currentUser;
        return { users: newUsers, currentUser };
    }),

    deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
    })),


    resetPassword: (id) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, password: "newpassword123" } : u)
    })),

    updateBooking: (updatedBooking) => set((state) => ({
        bookings: state.bookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
    })),

    cancelBooking: (id) => set((state) => ({
        bookings: state.bookings.map(b => b.id === id ? { ...b, status: "Cancelled" } : b)
    }))
}));
