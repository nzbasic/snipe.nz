import { Accordion, AccordionDetails, AccordionSummary } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface Props {
    title: string
    expanded?: true
}

export const SimpleSummaryAccordion: React.FC<Props>= ({ title, expanded, children }) => {

    return (
        <Accordion defaultExpanded={expanded} >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon className="text-white" />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                className="bg-dark00-accordion"
            >
                <span className="text-white">{title}</span>
            </AccordionSummary>
            <AccordionDetails className="bg-dark00-accordion">
                {children}
            </AccordionDetails>
        </Accordion>
    )
}