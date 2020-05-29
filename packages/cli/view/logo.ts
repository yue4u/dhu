import chalk from "chalk";
import pkg from "../package.json";

type renderLogoOptions = {
  color: boolean;
};

const logo = `
                         ,:::,             
                        :{ujt-:            
                     I|Oavi                
                  ;n*#h},                  
      ,i10#aOcYLJqhaO-                     
     IrQb#dx{<:                            
          :;l-jCkadJt_:                    
             ,>JMMMM#m_                    
           ,}Z#MMMMMU:                     ${chalk.bold(`Hello dhu`)}
         :tkMMMMM#ZuLaokpJ/~,              version: ${pkg.version}
       !XMMMMMM#w!      :{wMMMM*On]i:      Have a nice day!
     -Q#MMMMM#m-         ;J#MMMMMMMMLI     
    _kMMMMMMo[,         ,|*MMMMMMMMML;     ${chalk.bold(`To contribute:`)}
       Itpq1,           >kMMMMMMMMMMJ,     https://github.com/rainy-me/dhu
                       ,ZMMMMMMMMMMMz      
                       vMMMMMMMMMMM#n      made with ♡
                      ;bMMMMMMMMMMM*f      
                       ,|Lb#MMMMMMM*(      
                           I?npMMMMo}      
                               ,I{r+       
`;

export const renderLogo = ({ color }: renderLogoOptions) => {
  if (color) {
    // todo
    return;
  }
  console.log(logo);
};
