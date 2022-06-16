import React, { ReactElement } from 'react';

interface PropTypes {
  icon: ReactElement;
  text: string;
}

const InfoBox: React.FC<PropTypes> = ({ icon, text }) => (
  <div className="flex lg:flex-col px-4 lg:px-0 items-center justify-center border-function border-2 rounded py-6 gap-2">
    <>
      {icon}
    </>
    <div className="text-center w-full px-4">
      {text}
    </div>
  </div>
);


export default InfoBox;
