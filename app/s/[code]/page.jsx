import { redirect } from 'next/navigation';

export default async function ShortUrlRedirect({ params }) {
    const { code } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    
    // We can't easily fetch on server side without knowing the full URL if it's relative
    // But since it's a redirect page, we can just use a client component or a server-side fetch to the absolute API URL
    
    const res = await fetch(`${apiUrl}/s/${code}`, { cache: 'no-store' });
    
    // The API redirects, so we can just return the redirect to the API's location header if we were doing this in middleware
    // But here we'll just redirect to the API endpoint which will then redirect to the final destination
    
    redirect(`${apiUrl}/s/${code}`);
    
    return null;
}
