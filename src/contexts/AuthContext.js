'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (currentUser && !currentUser.user_metadata?.username && currentUser.email) {
          const username = currentUser.email.split('@')[0];
          await supabase.auth.updateUser({ data: { username } });
          setUser({ ...currentUser, user_metadata: { ...currentUser.user_metadata, username } });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Função de login (versão simplificada)
  const signIn = async (username, password) => {
    try {
      // Tentar diferentes formatos de email baseados no username
      const emailFormats = [
        `${username}@gmail.com`,
        `${username}@email.com`, 
        `${username}@teste.com`,
        username // caso seja um email real
      ];

      for (const email of emailFormats) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (data.user && !error) {
          return { data, error };
        }
      }

      // Se chegou aqui, nenhum formato funcionou
      return { 
        data: null, 
        error: { message: 'Username ou senha incorretos' } 
      };
    } catch (err) {
      return { 
        data: null, 
        error: { message: 'Erro ao fazer login' } 
      };
    }
  };

  // Função de cadastro (mais simples ainda)
  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      // Se cadastro ok, atualiza metadata com username
      if (data?.user) {
        await supabase.auth.updateUser({
          data: { username }
        });
      }

      return { data, error };
    } catch (err) {
      return { 
        data: null, 
        error: { message: 'Erro ao criar conta: ' + err.message } 
      };
    }
  };

  // Função de logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Qualquer usuário logado é admin
  const isAdmin = !!user;
  const value = {
    user,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
