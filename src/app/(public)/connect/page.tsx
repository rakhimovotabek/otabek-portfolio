import {claude} from "@/data/claude";
import {SubmissionForm} from "@/components/community/submission-form";
export default function Page(){return <><div dangerouslySetInnerHTML={{__html:claude.connect}}/><section><h2>A private message</h2><SubmissionForm id="contact" kind="contact"/></section></>}
