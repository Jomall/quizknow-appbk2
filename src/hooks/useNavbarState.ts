import { useState, useCallback } from 'react';
import { NavbarState } from '@/types/navbar.types';

export const useNavbarState = () => {
  const [state, setState] = useState<NavbarState>({
    mobileMenu: false,
    notifications: false,
    quickActions: false,
    searchFocused: false,
    userMenu: false,
  });

  const toggleState = useCallback((key: keyof NavbarState) => {
    setState(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  const closeAll = useCallback(() => {
    setState({
      mobileMenu: false,
      notifications: false,
      quickActions: false,
      searchFocused: false,
      userMenu: false,
    });
  }, []);

  const setStateValue = useCallback((key: keyof NavbarState, value: boolean) => {
    setState(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  return {
    state,
    toggleState,
    closeAll,
    setStateValue,
  };
};
