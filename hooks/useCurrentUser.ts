// hooks/useCurrentUser.ts
import { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const attrs = await fetchUserAttributes();
      setUser(attrs);
    };
    fetchUser();
  }, []);

  return user;
}