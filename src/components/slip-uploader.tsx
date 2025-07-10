'use client';
import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractTransactionDetails, ExtractTransactionDetailsOutput } from '@/ai/flows/extract-transaction-details';
import { validateExtractedTransactionDetails } from '@/ai/flows/validate-extracted-details';

interface SlipUploaderProps {
  onExtractionComplete: (data: ExtractTransactionDetailsOutput & { validationResult?: string }) => void;
}

export function SlipUploader({ onExtractionComplete }: SlipUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
            variant: "destructive",
            title: "File too large",
            description: "Please upload an image smaller than 4MB.",
        });
        return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;

      try {
        const extractedDetails = await extractTransactionDetails({ slipDataUri: dataUri });
        
        const validation = await validateExtractedTransactionDetails({
          account: extractedDetails.accountNumber,
          purpose: extractedDetails.purpose,
          payer: extractedDetails.payer,
          payee: extractedDetails.payee,
          amount: String(extractedDetails.amount),
        });
        
        onExtractionComplete({ ...extractedDetails, validationResult: validation.validationResult });

      } catch (error) {
        console.error("AI processing error:", error);
        toast({
          variant: "destructive",
          title: "Extraction Failed",
          description: "Could not read slip details. The image might be unclear. Please try again or enter manually.",
        });
      } finally {
        setIsLoading(false);
        // Reset file input
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      toast({
          variant: "destructive",
          title: "File Read Error",
          description: "Could not read the selected file.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 pt-4 pb-8">
      {isLoading ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Reading your slip, please wait...</p>
        </>
      ) : (
        <label
          htmlFor="slip-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer border-border hover:bg-muted/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 4MB)</p>
          </div>
          <input id="slip-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}
