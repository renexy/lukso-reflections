/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, CircularProgress, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useUpProvider } from "../services/providers/UPProvider";
import {
  addReflection,
  deleteReflection,
  editReflection,
  getReflectionById,
} from "../services/firebase/firebase";
import toast from "react-hot-toast";

/* eslint-disable @typescript-eslint/no-empty-object-type */
interface CreateReflectionProps {
  goBack: () => void;
  selectedReflectionId: string | null;
}

const CreateReflection: React.FC<CreateReflectionProps> = ({
  goBack,
  selectedReflectionId,
}) => {
  const { accounts } = useUpProvider();
  const [formData, setFormData] = useState<any>({ text: "" });
  const [reflectionCreating, setReflectionCreating] = useState<boolean>(true);

  useEffect(() => {
    if (selectedReflectionId) {
      getReflection();
    } else {
      setReflectionCreating(false);
    }
  }, [selectedReflectionId]);

  const getReflection = async () => {
    const result = await getReflectionById(selectedReflectionId!);
    setFormData({ text: (result as any).text });
    setReflectionCreating(false);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (value.length <= 250) {
      setFormData((prevState: any) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setReflectionCreating(true);

    const call = selectedReflectionId
      ? editReflection(selectedReflectionId, formData.text)
      : addReflection(accounts[0], formData.text);

    const data = await call;

    if (data === -1) {
      toast.error("Error creating reflection");
    } else {
      toast.success("Reflection created successfully");
      setFormData({ text: "" });
    }

    setReflectionCreating(false);
  };

  const deleteRe = async() => {
    setReflectionCreating(true);
    await deleteReflection(selectedReflectionId!);
    goBack();
  }

  return (
    <div
      className="bg-white bg-opacity-95 shadow-lg p-4 rounded-lg max-h-[540px] gap-10
    w-[500px] relative animate-fadeInSlideUp justify-center items-center flex flex-col justify-between"
    >
      {reflectionCreating ? (
        <div className="relative animate-fadeInSlideUp justify-center items-center flex flex-col justify-center gap-[20px]">
          <span>Please wait...</span>
          <CircularProgress color="secondary" />
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
            <TextField
              label="Your reflection..."
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              color="secondary"
              name="text"
              size="medium"
              value={formData.text}
              onChange={handleChange}
            />
            <span className="text-sm text-gray-500">
              {formData.text.length}/250
            </span>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="small"
            >
              {selectedReflectionId ? "Edit Reflection" : "Add Reflection"} 💡
            </Button>

            {selectedReflectionId && (
              <Button
                onClick={deleteRe}
                variant="contained"
                color="secondary"
                size="small"
              >
                Delete Reflection 💡
              </Button>
            )}
          </form>
          <Button
            variant="contained"
            color="secondary"
            onClick={goBack}
            size="small"
          >
            Or go back
          </Button>
        </>
      )}
    </div>
  );
};

export default CreateReflection;
