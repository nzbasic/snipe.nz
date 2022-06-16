import { GitHub, Twitter } from '@material-ui/icons';

import React from 'react';

const Footer: React.FC = () => (
  <div className="max-h-16 h-16 bg-function w-full flex justify-center items-center gap-4">
    <span className="">Site by nzbasic</span>
    <a
        href="https://github.com/nzbasic/snipe.nz"
        target="_blank"
        rel="noreferrer"
        className="flex items-center"
    >
        <GitHub fontSize="small" />
    </a>
    <a
        href="https://osu.ppy.sh/users/9008211"
        target="_blank"
        rel="noreferrer"
        className="flex items-center hover:text-main-four cursor-pointer"
    >
        osu!
    </a>
    <a
        href="https://twitter.com/nzbasic"
        target="_blank"
        rel="noreferrer"
        className="flex items-center"
    >
        <Twitter fontSize="small" />
    </a>
    <a href="https://buymeacoffee.com/nzbasic" target="_blank" rel="noreferrer" >Donate</a>
  </div>
);


export default Footer;
