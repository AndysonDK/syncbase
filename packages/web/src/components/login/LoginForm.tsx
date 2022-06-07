import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "urql";
import { z } from "zod";
import { LoginUserDocument } from "../../graphql/hooks";
import { useLoginDialog } from "../../hooks/useLoginDialog";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";
import { showResultErrors } from "./utils/showResultErrors";
import type { FC } from "react";
import type { SubmitHandler } from "react-hook-form";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "An email is required" })
    .email({ message: "Not a valid email" }),
  password: z
    .string()
    .min(1, { message: "A password is required" })
    .min(7, "Must be equal to or more than 7 characters")
    .max(30, "Must be less than or equal to 30 characters"),
});

type LoginInput = z.infer<typeof schema>;

export const LoginForm: FC = () => {
  const dialog = useLoginDialog();
  const [, submitInput] = useMutation(LoginUserDocument);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    const result = await submitInput({ userInput: data });
    if (!showResultErrors(result, setError)) dialog.close();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-3">
      <InputField
        label="Email"
        name="email"
        errorMsg={errors.email?.message}
        register={register}
      />
      <InputField
        label="Password"
        name="password"
        type="password"
        errorMsg={errors.password?.message}
        register={register}
      />
      <Button label="Login" type="submit" loading={isSubmitting} />
      <Button onClick={dialog.close} label="Cancel" />
    </form>
  );
};
