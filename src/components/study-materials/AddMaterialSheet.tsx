import { useState } from 'react';
import { FileText, Link2, Upload, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudyMaterials } from '@/hooks/useStudyMaterials';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface AddMaterialSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = ['DSA', 'Development', 'Cloud', 'Core Subjects', 'Custom'];
const MATERIAL_TYPES = [
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'link', label: 'Link/URL', icon: Link2 },
  { value: 'note', label: 'Note', icon: FileText },
];

export function AddMaterialSheet({ open, onOpenChange }: AddMaterialSheetProps) {
  const { createMaterial } = useStudyMaterials();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    material_type: '',
    description: '',
    url: '',
    content: '',
    tags: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadPDF = async (): Promise<string | null> => {
    if (!selectedFile || !user) return null;
    
    setUploadingFile(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('study-materials')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('study-materials')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload PDF');
      return null;
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.material_type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let fileUrl = formData.url;
      let filePath: string | undefined;

      if (formData.material_type === 'pdf' && selectedFile) {
        const uploadedPath = await uploadPDF();
        if (uploadedPath) {
          filePath = uploadedPath;
          fileUrl = uploadedPath;
        }
      }

      const tags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createMaterial({
        title: formData.title,
        category: formData.category,
        material_type: formData.material_type,
        description: formData.description || undefined,
        url: fileUrl || undefined,
        content: formData.content || undefined,
        file_path: filePath,
        tags: tags.length > 0 ? tags : undefined,
        status: 'not_started',
      });

      setFormData({
        title: '',
        category: '',
        material_type: '',
        description: '',
        url: '',
        content: '',
        tags: '',
      });
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating material:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add Study Material</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Binary Search Tutorial"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Material Type */}
          <div className="space-y-2">
            <Label>Material Type *</Label>
            <Select
              value={formData.material_type}
              onValueChange={(value) => setFormData({ ...formData, material_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PDF Upload */}
          {formData.material_type === 'pdf' && (
            <div className="space-y-2">
              <Label>Upload PDF</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-sm text-foreground-muted">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-2 hover:bg-secondary rounded-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                    <p className="text-sm text-foreground-muted mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-foreground-muted">PDF only, max 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* URL Input */}
          {formData.material_type === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/resource"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required={formData.material_type === 'link'}
              />
            </div>
          )}

          {/* Note Content */}
          {formData.material_type === 'note' && (
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your notes here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this material..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="algorithms, sorting, interview (comma-separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
            <p className="text-xs text-foreground-muted">Separate tags with commas</p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || uploadingFile}
            >
              {uploadingFile ? 'Uploading...' : loading ? 'Adding...' : 'Add Material'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
