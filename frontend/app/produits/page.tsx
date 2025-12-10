import { ProHeader } from "@/components/header/ProHeader";
import { CategorySlider } from "@/components/categories/CategorySlider";
import { Fragment } from "react/jsx-runtime";

export default function ProductsPage() {
  return (
    <Fragment>
      <ProHeader />
      <CategorySlider />
    </Fragment>
  );
}
