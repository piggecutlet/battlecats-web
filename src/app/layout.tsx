import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const RootLayout = ({ children }: Props) => (
  <html lang="ja">
    <body>
      <main>{children}</main>
    </body>
  </html>
);

export default RootLayout;
