import { Helmet } from "react-helmet";
import React from "react";

const Regulations = () => {
    return (
        <div className={"p-10 max-sm:mb-32"}>
            <Helmet>
                <title>StuySU Clubs & Pubs Regulations</title>
                <meta
                    name="description"
                    content="Official regulations for Activities at Stuyvesant High School, including guidelines for meetings, funding, and room usage."
                />
            </Helmet>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "w-2/3 bg-blend-color-dodge sm:text-8xl text-4xl sm:text-center font-light"
                    }
                >
                    Clubs & Pubs
                    <br />
                    Regulations
                </h1>
            </div>
            <div className={"flex flex-row sm:mx-5 justify-center"}>
                <div className={"w-1/4 sticky top-20 h-96 sm:block hidden"}>
                    <h4 className={"mb-3"}>Table of Contents</h4>
                    <ul className={"space-y-1"}>
                        <li>
                            <p>
                                <a href="#general">General Guidance</a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="#activity">Activity Meetings</a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="#online">Online Meetings</a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="#reservations">
                                    Room Reservations and Usage
                                </a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="#funding">Funding</a>
                            </p>
                        </li>
                        <li>
                            <p>
                                <a href="#finances">Fundraising & Finances</a>
                            </p>
                        </li>
                    </ul>
                </div>
                <div
                    className={
                        "w-full sm:w-3/4 max-w-3xl pl-0 sm:pl-7 md:pl-14"
                    }
                >
                    <h4 className={"mb-3"} id={"general"}>
                        General Guidance
                    </h4>
                    <p className={"mb-10"}>
                        For any issues or difficulties with the Epsilon
                        StuyActivities service, visit the{" "}
                        <a
                            href="/activities-support"
                            target="_blank"
                            rel="noreferrer"
                        >
                            support page
                        </a>{" "}
                        or consult directly with a Student Union (SU)
                        representative. An Activity can operate only after its
                        charter is submitted to and approved by the Clubs & Pubs
                        administrators. Charters are reviewed on a fixed day
                        each week and may be approved only between August 1 and
                        May 31. Once a charter is approved, it becomes visible
                        on the Epsilon site and the Activity leaders receive
                        email confirmation. <br />
                        <br />
                        Every Activity must have at least two leaders—either two
                        co‑presidents or a president and vice‑president—and must
                        meet at least once per month, in person or online, with
                        each meeting registered on Epsilon. Activities inactive
                        for more than one month risk suspension or revocation of
                        their charter. The SU may merge Activities with
                        substantially similar missions, may suspend any Activity
                        that violates its charter, and requires that all charter
                        changes receive prior approval from the Clubs & Pubs
                        department. Every Activity must comply with{" "}
                        <a
                            href="https://www.schools.nyc.gov/docs/default-source/default-document-library/a-601-english"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Chancellor’s Regulation A‑601
                        </a>
                        {", "}
                        all other{" "}
                        <a
                            href="https://www.schools.nyc.gov/about-us/policies/chancellors-regulations"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Chancellor’s Regulations
                        </a>
                        {", "}
                        the{" "}
                        <a
                            href="https://stuy.enschool.org/apps/pages/index.jsp?uREC_ID=126635&type=d"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Stuyvesant Code of Conduct
                        </a>
                        {", "}
                        and relevant school policies. Violations result in
                        immediate suspension and charter revocation.
                        <br />
                        <br />
                        Finally, every Activity must maintain at least ten
                        official members, not counting faculty advisors, after
                        each ClubPub fair. Features such as scheduling meetings
                        and creating posts are only available to Activities with
                        at least ten members.
                        <br />
                        <br />
                        Any violation of the Clubs & Pubs Regulations may result
                        in a strike unless otherwise noted; three
                        strikes—regardless of cause—revoke the charter and
                        cannot be appealed.{" "}
                    </p>

                    <h4 className={"mb-3"} id={"activity"}>
                        Activity Meetings
                    </h4>
                    <p className={"mb-10"}>
                        All meetings are subject to audit by an SU Auditor, who
                        reports to the directors of the SU Clubs & Pubs
                        department.
                        <br />
                        <br />
                        Meetings must remain orderly and respectful. Complaints
                        by staff or SU Auditors concerning inappropriate
                        behavior—such as fighting, roughhousing, discriminatory
                        remarks, or any breach of the Code of Conduct or
                        Chancellor’s Regulations—may lead to immediate
                        suspension.
                        <br />
                        <br />
                        For events or meetings off school premises, the
                        registered faculty advisor must contact
                        clubpub@stuysu.org and COSA Mr. Polazzo
                        (MPolazz@schools.nyc.gov, Room 260) at least one week in
                        advance with full event details and must attend the
                        entire event alongside the faculty advisor for the
                        Activity. The correspondence should detail the date,
                        location, paperwork, number of people attending,
                        Activity leader(s) and faculty advisor names for the
                        event.
                        <br />
                        <br />
                        Activities must vacate the building by 5:00 PM unless
                        accompanied by a registered faculty advisor. SMARTBoards
                        may not be used during meetings, and media carts may be
                        borrowed only when a faculty advisor signs them in and
                        out. Flyers or advertisements may not be posted until a
                        charter is approved; all flyers must be removed within a
                        week after the event, and any flyer deemed
                        inappropriate—or placed near escalators—will be removed
                        without notice.
                    </p>

                    <h4 className={"mb-3"} id={"online"}>
                        Online Meetings
                    </h4>
                    <p className={"mb-10"}>
                        Official meetings may be hosted online provided that
                        links and schedules for every meeting are posted on
                        Epsilon and that meetings occur between 2:30 PM and 8:00
                        PM. If uninvited guests appear, or if any participant
                        engages in disrespectful comments, bullying, or other
                        misconduct that violates the Code of Conduct, the
                        meeting must end immediately and the incident must be
                        reported to MPolazz@schools.nyc.gov and
                        clubpub@stuysu.org. Failure to report such incidents may
                        result in immediate charter revocation.
                    </p>

                    <h4 className={"mb-3"} id={"reservations"}>
                        Room Reservations and Usage
                    </h4>
                    <p className={"mb-10"}>
                        All Activities must reserve a room to be able to hold a
                        meeting. Rooms must be reserved on Epsilon
                        StuyActivities, which operates on a first‑come,
                        first‑served basis.
                        <span className={"important"}>
                            {" "}
                            No Activity is guaranteed a particular room.
                        </span>
                        <br />
                        <br />
                        Long‑term reservations require an email request to
                        clubpub@stuysu.org explaining the need, and excessive
                        room bookings will be monitored. Rooms must be
                        restored to their original condition after each meeting;
                        staff or Auditor complaints about cleanliness or damage
                        may result in strikes or suspension. Clubs must use
                        the specific room indicated on Epsilon, cancel
                        reservations at least 24 hours in advance if plans
                        change, and email clubpub@stuysu.org or consult an SU
                        representative if no suitable room is available. Any club
                        found not using a room that has been reserved or has not had
                        its reservation cancelled at least 24 hours in advance
                        will receive a strike.
                        Reserving non‑classroom facilities—such as the
                        cafeteria, auditorium, or lecture halls—requires the
                        faculty advisor to email clubpub@stuysu.org and Mr.
                        Polazzo at least one week ahead with full justification
                        and logistics. Guest speakers may enter the building
                        only after all listed parties approve the request and
                        School Safety Agents are notified.
                    </p>

                    <h4 className={"mb-3"} id={"funding"}>
                        Funding
                    </h4>
                    <p className={"mb-10"}>
                        The SU manages all Activity funding. Requests will be
                        denied if they involve unapproved trips, unapproved
                        supplies or services (including guest speakers),
                        personal items that members keep, faculty‑advisor
                        compensation, computer systems or software, food or
                        beverages, or apparel. Two funding rounds occur each
                        year—one in Fall and one in Spring. Prior to each round,
                        Activities receive a budget application and rules. Only
                        Activities needing funds should apply, and compliant
                        applicants are scheduled for a meeting with the SU
                        Budget Committee. At least one Activity leader and the
                        faculty advisor must attend; failure to do so results in
                        automatic denial, while legitimate conflicts must be
                        emailed in advance to clubpub@stuysu.org and
                        budget@stuysu.org.
                        <br />
                        <br />
                        When requesting support, an Activity may seek either a
                        grant or a loan. A grant requires the Activity to pay
                        upfront, retain original receipts, and submit them to
                        budget@stuysu.org for reimbursement (excluding tax).
                        Reimbursement checks are available from Ms. Caruzo in
                        Room 103 roughly two weeks after submission, and the
                        tax‑exempt form supplied by the Budget Department should
                        be used to avoid sales tax. A loan must be repaid by the
                        end of the school year unless otherwise specified.
                        Acceptance of SU funds obligates Activities to cooperate
                        fully with audits, submit receipts within seven days of
                        each purchase, present purchased items on request, and
                        return all items to SU storage at year‑end; items are
                        reissued the next year if the Activity still exists,
                        otherwise the SU retains them. First violations trigger
                        a strike unless severe; a second infraction allows the
                        Budget Department to withdraw funding and suspend the
                        Activity. Any misuse of funds results in immediate
                        suspension and charter revocation. Funding rules may be
                        amended by majority vote of the Budget Committee.
                        <br />
                        <br />A faculty advisor must be present for speakers or
                        lectures in large venues, for any off‑site event with
                        members present, for meetings in the building after 5:00
                        PM, and whenever SU funding is requested. The advisor
                        must also sign the “Advisor/COSA” field on reimbursement
                        forms for purchases made with Clubs & Pubs allocations.
                        Activities that have accumulated three strikes may
                        reapply for a charter after suspension; if reinstated, a
                        faculty advisor must attend all meetings until the SU
                        states otherwise.
                    </p>

                    <h4 className={"mb-3"} id={"finances"}>
                        Fundraising & Finances
                    </h4>
                    <p className={"mb-10"}>
                        Before undertaking any fundraising, consult the complete{" "}
                        <a
                            href="https://docs.google.com/document/d/10RD4PIHYYiHTLBMGyKlfOlHU60kzJ8l7PTl4jHjFOmQ/edit?usp=sharing"
                            target="_blank"
                            rel="noreferrer"
                        >
                            StuySU Fundraising Guidelines
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://docs.google.com/document/d/1iXmJKKf6PvroDvOQSekMJFwnokJHgCApGqKx4uNYfM0/edit?usp=sharing"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Staff Treasury Memo
                        </a>
                        {". "}
                        Equipment, supplies, and services must be purchased
                        through FAMIS and ShopDOE in accordance with NYC DOE
                        Standard Operating Procedures; certain items may be
                        purchased with General School Funds only after written
                        approval from the Business Manager, APO, and Principal.
                        Personal funds should not be used without prior written
                        approval, as reimbursements are otherwise prohibited and
                        tax is never reimbursed. Expenditure requests must be
                        filed on the official “Request for Expenditure” form,
                        accompanied by invoices (not quotes or statements)
                        within two weeks of delivery or payment. Requests
                        associated with events, trips, or merchandise require
                        supporting documents such as agendas, attendance sheets,
                        trip approval forms, or signed packing slips.
                        <br />
                        <br />
                        Deposits are accepted only by Dina Ingram in Room 105 or
                        273C on Tuesdays and Thursdays. Cash and checks must be
                        separated by denomination; checks must be payable to
                        Stuyvesant High School and include the student’s name
                        and OSIS on the memo line. The “Authorization to Collect
                        General School Funds” form must be completed before
                        collecting any money, and only faculty advisors or
                        designated staff may oversee the process—students may
                        never handle funds directly. All fundraising requires
                        prior written approval on this form, and every event
                        must complete a “Final Statement at Conclusion of
                        Revenue Producing Activity” reporting all sales and
                        profits or losses. Funds must be deposited immediately
                        after the event or within three days and never stored
                        off campus or with students. Only cash and checks may be
                        deposited, although the school website may be used for
                        large electronic payments. All forms for financial
                        transactions are available in Room 105, and checks are
                        processed twice weekly on Tuesdays and Thursdays.
                    </p>

                    <p className={"mb-10"}>
                        ANY ACTIVITY THAT DOES NOT COMPLY WITH THESE RULES WILL
                        NOT BE CHARTERED. THE STUYVESANT STUDENT UNION RESERVES
                        THE RIGHT TO SUSPEND, ISSUE STRIKES TO, OR REVOKE THE
                        CHARTER OF ANY ACTIVITY THAT FAILS TO FOLLOW THESE
                        REGULATIONS WITHOUT PRIOR NOTICE.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Regulations;
