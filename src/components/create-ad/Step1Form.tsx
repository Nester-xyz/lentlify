import React from "react";
import CustomizedInput from "@/components/atoms/CustomizedInput";
import MultiSelectInput from "@/components/atoms/MultiselectInput";
import type { TCampaignData } from "../../pages/create-ad/index";

interface Step1FormProps {
  data: TCampaignData;
  setData: React.Dispatch<React.SetStateAction<TCampaignData>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const Step1Form: React.FC<Step1FormProps> = ({
  data,
  setData,
  categories,
  setCategories,
}) => {
  return (
    <div className="w-full">
      <div className="w-full space-y-6">
        <CustomizedInput
          label="Campaign Title"
          name="campaign_title"
          type="text"
          placeholder="Summer Vibes"
          value={data.campaign_title}
          onChange={(e) => setData({ ...data, campaign_title: e.target.value })}
        />
        <CustomizedInput
          label="Campaign Description"
          name="campaign_description"
          type="textarea"
          placeholder="Describe your campaign"
          value={data.campaign_description}
          onChange={(e) =>
            setData({ ...data, campaign_description: e.target.value })
          }
        />
        <MultiSelectInput
          name="tags"
          label="Add Categories"
          value={categories}
          onChange={setCategories}
          placeholder="Type and press Enter to add..."
        />
      </div>
    </div>
  );
};

export default Step1Form;
