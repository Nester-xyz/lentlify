import { UseAuth } from "@/context/auth/AuthContext";

const Profile = () => {
  const { profile } = UseAuth();

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
      {/* Cover and Profile Picture */}
      <div
        className="relative h-48 bg-gray-200 dark:bg-gray-700 bg-cover bg-center"
        style={profile.coverPicture ? { backgroundImage: `url(${profile.coverPicture})` } : undefined}
      >
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-400 flex items-center justify-center text-white font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {profile.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Joined: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          {profile.bio && (
            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
          )}
          <p className="text-gray-500 dark:text-gray-400">{profile.address}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
