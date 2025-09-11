'use server';

import { redirect } from 'next/navigation';

// Mock function to check authentication
// In a real app, this would check a session, cookie, or token
async function isAuthenticated() {
  // For now, we'll simulate a logged-out user
  // to demonstrate the redirect.
  return false; 
}

export default async function HomePage() {
  const loggedIn = await isAuthenticated();

  if (!loggedIn) {
    redirect('/login');
  }

  // The rest of the page component will only be rendered if the user is authenticated.
  // We can rebuild the influencer form and list here later.
  return (
    <div>
      <h1>Bem-vindo ao Mural de Influência!</h1>
      <p>Conteúdo protegido.</p>
    </div>
  );
}
