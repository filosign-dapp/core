import type React from "react";
import { twMerge } from "tailwind-merge";

interface Mutation<TArgs = void> {
    mutate: TArgs extends void ? () => void : (args: TArgs) => void;
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: Error | null;
}

interface ButtonProps<TArgs = void> {
    mutation: Mutation<TArgs>;
    mutationArgs?: TArgs extends void ? never : TArgs;
    children: React.ReactNode;
    className?: string;
}

const Button = <TArgs = void>({
    mutation,
    mutationArgs,
    children,
    className = "",
}: ButtonProps<TArgs>) => {
    const { mutate, isPending, isError, isSuccess, error } = mutation;

    const handleClick = () => {
        if (!isPending) {
            if (mutationArgs !== undefined) {
                (mutate as (args: TArgs) => void)(mutationArgs);
            } else {
                (mutate as () => void)();
            }
        }
    };

    const baseClasses =
        "px-4 py-2 cursor-pointer rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const getButtonClasses = () => {
        const stateClasses = isPending
            ? "bg-gray-400 text-gray-700 cursor-not-allowed cursor-progress"
            : isError
                ? "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
                : isSuccess
                    ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                    : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500";

        return twMerge(baseClasses, stateClasses, className);
    };

    const getButtonText = () => {
        if (isPending) return "Loading...";
        if (isError) return "Retry";
        if (isSuccess) return "Success!";
        return children;
    };

    const getErrorMessage = () => {
        if (error instanceof Error) {
            return error.message;
        }
        return String(error);
    };

    return (
        <div className="inline-block">
            <button
                type="button"
                onClick={handleClick}
                disabled={isPending}
                className={getButtonClasses()}
            >
                {getButtonText()}
            </button>
            {isError && error && (
                <p className="text-red-500 text-sm mt-1">Error: {getErrorMessage()}</p>
            )}
        </div>
    );
};

export default Button;
