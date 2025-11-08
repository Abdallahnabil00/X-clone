import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
     const {mutateAsync: updateProfile, isPending: isUpdating} = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch('/api/user/update', {
					method: 'post',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(formData)
				});
				const data = await res.json();
				if(!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			}catch(error) {
				throw new Error(error.message || "Something went wrong");
					}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({queryKey: ['userProfile']}),
				queryClient.invalidateQueries({queryKey: ['authUser']}),
			])
		},
		onError: (error) => {
			toast.error(error.message);
		}
	})
    return {updateProfile, isUpdating};

}