// @ts-nocheck
import { useState, useEffect } from 'react';

// Mock data hook for branches
export function useBranches() {
    return {
        branches: ["Main Branch", "Surat Hub", "Mumbai Gateway"],
        loading: false,
        error: null,
        refresh: () => { }
    };
}
