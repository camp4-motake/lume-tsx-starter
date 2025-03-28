import Heading from "../_components/heading.tsx";
import Image from "../_components/Image.tsx";

export type Components = {
  Heading: typeof Heading;
  Image: typeof Image;
};

export interface LayoutProps<T extends Components> {
  comp: T;
}
