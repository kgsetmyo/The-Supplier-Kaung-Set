import { Header } from "@/components/Header";
import { ProductDetailSkeleton } from "@/components/skeletons";

/** Product detail route — layout-matched skeleton while fetching. */
export default function ProductDetailLoading() {
  return (
    <>
      <Header showSearch={false} />
      <ProductDetailSkeleton />
    </>
  );
}
