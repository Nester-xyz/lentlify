import React from "react";
import WalletSelector from "../../components/WalletSelector";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <WalletSelector />
        </div>
      </div>
    </div>
  );
};

export default Login;
