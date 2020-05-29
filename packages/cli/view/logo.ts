import chalk from "chalk";
import pkg from "../package.json";

const w = chalk.white;

// prettier-ignore
const logo = `
                         ,:::,             
                        :{ujt-:            
                     I|Oavi                
                  ;n*#h},                  
      ,i10#aOcYLJqhaO-                     
     IrQb#dx{<:                            ${chalk.yellow.bold(`dhu`)}
          :;l-jCkadJt_:                    ${w(`version: ${pkg.version}`)}
             ,>JMMMM#m_                    
           ,}Z#MMMMMU:                     ${w(`Have a nice day!`)}
         :tkMMMMM#ZuLaokpJ/~,              
       !XMMMMMM#w!      :{wMMMM*On]i:      ${chalk.yellow.bold(`To contribute:`)}
     -Q#MMMMM#m-         ;J#MMMMMMMMLI     ${w(`@see https://github.com/rainy-me/dhu`)}
    _kMMMMMMo[,         ,|*MMMMMMMMML;     
       Itpq1,           >kMMMMMMMMMMJ,     
                       ,ZMMMMMMMMMMMz      
                       vMMMMMMMMMMM#n      ${w(`made with ♡`)}
                      ;bMMMMMMMMMMM*f      
                       ,|Lb#MMMMMMM*(      
                           I?npMMMMo}      
                               ,I{r+       
`;

export const renderLogo = () => {
  const orange = chalk.rgb(233, 99, 29);
  console.log(orange(logo));
};
