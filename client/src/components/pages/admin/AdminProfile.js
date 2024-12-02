import React from 'react';

const Profile = () => {
    return (
        <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 dark:bg-neutral-900">
            <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Hello, World!
                </h1>
                <p className="text-neutral-700 dark:text-neutral-400">
                    Welcome to the Admin profile.
                </p>
            </div>
        </div>
    );
};

export default Profile;