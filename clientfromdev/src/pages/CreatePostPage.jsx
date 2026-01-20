// src/pages/CreatePostPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreatePostForm from '../components/CreatePostForm';

export default function CreatePostPage() {
    const navigate = useNavigate();

    // Optional: Redirect if not logged in (you can add auth check later)
    // For now, assume user is logged in (cookie handled by backend)

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4">
            <CreatePostForm />
        </div>
    );
}