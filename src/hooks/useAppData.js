import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Laadt de statische referentiedata die door de hele app gebruikt wordt:
 * CRM-skills, verticals, rollen en industrieën.
 *
 * Return-formaat: arrays van strings (zoals in TL_V2_4_NT.jsx),
 * bijv. crmSkills = ["Regulatory Affairs", "QA", ...]
 */
export function useAppData() {
  const [crmSkills,  setCrmSkills]  = useState([]);
  const [verticals,  setVerticals]  = useState([]);
  const [roles,      setRoles]      = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [s, v, r, i] = await Promise.all([
          supabase.from('skills').select('name'),
          supabase.from('verticals').select('name'),
          supabase.from('roles').select('name'),
          supabase.from('industries').select('name'),
        ]);

        if (s.error) throw s.error;
        if (v.error) throw v.error;
        if (r.error) throw r.error;
        if (i.error) throw i.error;

        // Map naar string-arrays — zelfde formaat als TL_V2_4_NT.jsx
        if (Array.isArray(s.data)) setCrmSkills(s.data.map(x => x.name));
        if (Array.isArray(v.data)) setVerticals(v.data.map(x => x.name));
        if (Array.isArray(r.data)) setRoles(r.data.map(x => x.name));
        if (Array.isArray(i.data)) setIndustries(i.data.map(x => x.name));
      } catch (err) {
        console.error('Fout bij ophalen referentiedata:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return { crmSkills, verticals, roles, industries, loading, error };
}
