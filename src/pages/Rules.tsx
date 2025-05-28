import { Box, Link, Typography } from "@mui/material";

const Rules = () => {
    return (
        <Box sx={{ padding: "40px" }}>
            <div className={"flex justify-center items-center w-full h-96"}>
                <h1
                    className={
                        "w-2/3 bg-blend-color-dodge text-white/75 text-8xl text-center"
                    }
                >
                    Clubs & Pubs
                    <br />
                    Regulations
                </h1>
            </div>
            <div className={"flex flex-row mx-5 justify-center"}>
                <div className={"w-1/4 sticky top-20 h-96"}>
                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Table of Contents
                    </Typography>
                    <ul>
                        <li>
                            <Link href="#a">General Guidance</Link>
                        </li>
                        <li>
                            <Link href="#a">Charter Submission & Approval</Link>
                        </li>
                        <li>
                            <Link href="#a">Online Meetings</Link>
                        </li>
                        <li>
                            <Link href="#a">Activity Meetings</Link>
                        </li>
                        <li>
                            <Link href="#a">Room Reservations and Usage</Link>
                        </li>
                        <li>
                            <Link href="#a">Funding Regulations</Link>
                        </li>
                        <li>
                            <Link href="#a">Fundraising & Finances</Link>
                        </li>
                        <li>
                            <Link href="#fundraising">
                                Faculty Advisor Requirements
                            </Link>
                        </li>
                        <li>
                            <Link href="#fundraising">Charter Compliance</Link>
                        </li>
                    </ul>
                </div>
                <div className={"w-3/4 max-w-3xl pl-7 md:pl-14"}>
                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        General Guidance
                    </Typography>
                    <Typography paragraph marginBottom={5}>
                        For any issues or difficulties with Epsilon, visit the
                        Epsilon support page, StuyActivities support page, or
                        consult directly with a Student Union (SU)
                        representative. Activities must follow the rules and
                        regulations set by the Stuyvesant Student Union and
                        adhere to the New York City Department of Education
                        Chancellor’s Regulation A-601 and the Stuyvesant Code of
                        Conduct. The Student Union reserves the right to
                        facilitate mergers of highly similar Activities and may
                        suspend Activities that violate their charter rules.
                        Activities must also maintain at least ten official
                        members after the Clubs & Pubs Fair, excluding any
                        faculty administrators.
                    </Typography>

                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Charter Submission & Approval
                    </Typography>
                    <Typography paragraph marginBottom={5}>
                        For an Activity to operate, a charter must be submitted
                        and approved by the Clubs & Pubs administrators.
                        Approval takes place every Saturday, and the charter
                        submission window runs from August 1st to May 31st. Once
                        approved, the charter will be visible on the Epsilon
                        website, and Activity leaders will be notified via email
                        when their charter is in the catalog. All Activities
                        must have at least two leaders (e.g., two co-presidents
                        or a president and a vice-president). Activities must
                        meet in person or online at least once a month by
                        registering an Activity meeting on the Epsilon website.
                        Any Activity found inactive for more than a month may
                        face suspension or revocation of their charter. Any
                        changes to a charter must be submitted for approval by
                        the Clubs & Pubs department.
                    </Typography>

                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Online Meetings
                    </Typography>
                    <Typography paragraph marginBottom={5}>
                        Official Activity meetings may be hosted online, with
                        meeting links made accessible through Epsilon. All
                        online Activity meetings must be scheduled on Epsilon
                        and must take place between 2:30 PM and 8:00 PM. If any
                        online meeting encounters uninvited guests or
                        inappropriate behavior, such as disrespectful comments,
                        bullying, or code of conduct violations, the meeting
                        must be immediately ended. Such incidents must be
                        reported to both MPolazz@schools.nyc.gov and
                        clubpub@stuysu.org.
                    </Typography>

                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Activity Meetings
                    </Typography>
                    <Typography paragraph marginBottom={5}>
                        Activities must hold meetings at least once a month,
                        either in person or online, through the Epsilon website.
                        Any Activity found violating the rules can receive
                        strikes or face suspension. Accumulating three strikes
                        will result in the revocation of the Activity’s charter,
                        which will require reapplication. Strikes cannot be
                        appealed, and all Activity meetings will be audited by
                        an SU Auditor. Inappropriate behavior such as fighting,
                        roughhousing, or discriminatory comments can result in
                        suspension or other disciplinary actions for the
                        students involved, and/or suspension or revocation of
                        the Activity charter.
                        <br />
                        <br />
                        If an Activity wishes to conduct meetings outside the
                        school’s premises, the registered Activity faculty
                        advisor (not student leaders) must email
                        clubpub@stuysu.org, COSA Matthew Polazzo
                        (MPolazz@schools.nyc.gov), and Assistant Principal Brian
                        Moran (BMoran@schools.nyc.gov), at least one week in
                        advance. The email should have the subject line:
                        “Activity Meeting Outside of School Premises: [ACTIVITY
                        NAME]” and include details about the event such as the
                        date, location, number of attendees, and the names of
                        both the Activity and faculty leaders. A faculty advisor
                        must be present for the entirety of the event. Failure
                        to comply may result in suspension or revocation of the
                        charter.
                        <br />
                        <br />
                        All Activities must vacate the school building by 5:00
                        PM unless a registered Faculty Advisor is present.
                        Activities are prohibited from using SMARTBoards. Media
                        carts from the programming office may only be used with
                        a faculty advisor to sign them in and out. Flyers and
                        advertisements for an Activity are only allowed after
                        the charter is approved. All flyers must be removed
                        within a week after the advertised event. Inappropriate
                        flyers will be taken down without warning, and flyers
                        near escalators will be relocated or removed at the SU’s
                        discretion.
                    </Typography>

                    <Typography variant={"h4"} color="primary" marginBottom={2}>
                        Room Reservations and Usage
                    </Typography>
                    <Typography paragraph marginBottom={5}>
                        Activities must reserve rooms on the Epsilon website to
                        hold meetings, and no Activity is entitled to a specific
                        room. Room reservations operate on a first-come,
                        first-served basis. If a long-term room reservation is
                        needed, leaders must email clubpub@stuysu.org with the
                        subject line: “Long Term Room Reservation: [ACTIVITY
                        NAME]”, including the reason for the reservation. Rooms
                        must be left clean and orderly after each meeting. Any
                        complaints about the condition of the room can result in
                        strikes or suspension of the charter. If the reserved
                        room is no longer needed, the reservation must be
                        canceled at least 24 hours in advance.
                        <br />
                        <br />
                        For using other school facilities such as the cafeteria,
                        auditorium, or lecture halls, the registered faculty
                        advisor must email clubpub@stuysu.org, Matthew Polazzo,
                        and Brian Moran with at least one week’s notice, using
                        the subject line: “[NAME OF FACILITY] Reservation:
                        [ACTIVITY NAME]”. The email should detail the reason for
                        reserving the space, date, location, and number of
                        people attending, along with the names of Activity
                        leaders. Guest speakers require prior approval from all
                        mentioned entities, and School Safety Agents must be
                        notified in advance.
                    </Typography>

                    <Typography>
                        <ol>
                            <li></li>
                            <li>
                                All Activities must have at least two leaders
                                (i.e. two co-presidents or a president and a
                                vice-president).
                            </li>
                            <li>
                                All Activities must meet in person or online at
                                least once a month by registering an Activity
                                meeting on the Epsilon website. Any Activity
                                found inactive for more than one month may face
                                suspension or revocation of their charter.
                            </li>
                            <li>
                                The Student Union reserves the right to
                                facilitate mergers of highly similar Activities
                                that share the same mission or are found to have
                                excessive similarities with the approval of the
                                Coordinator of Student Affairs (COSA).
                            </li>
                            <li>
                                The Student Union may suspend Activities that
                                violate their charter rules. All Activities must
                                adhere to their submitted charter, and any
                                changes must be approved by the ClubPub
                                department.
                            </li>
                            <li>
                                All Activities must adhere to the New York City
                                Department of Education{" "}
                                <Link
                                    color="primary"
                                    href="https://www.schools.nyc.gov/docs/default-source/default-document-library/a-601-english"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Chancellor’s Regulation A-601
                                </Link>
                                . Any Activity that violates this regulation or
                                other{" "}
                                <Link
                                    color="primary"
                                    href="https://www.schools.nyc.gov/about-us/policies/chancellors-regulations"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Chancellor’s Regulations
                                </Link>
                                &nbsp;will face suspension and revocation of
                                their charter.
                            </li>
                            <li>
                                All Activities must adhere to the{" "}
                                <Link
                                    color="primary"
                                    href="https://stuy.enschool.org/apps/pages/index.jsp?uREC_ID=126635&type=d"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Stuyvesant Code of Conduct
                                </Link>
                                &nbsp;and other school policies. Any Activity
                                that violates these regulations will face
                                suspension and revocation of their charter.
                            </li>
                            <li>
                                All clubs must maintain at least 10 official
                                members after the ClubPub Fair excluding any
                                faculty administrators.
                            </li>
                        </ol>
                    </Typography>
                    <Typography variant={"h5"} color="primary">
                        Official Regulations for Online Club Meetings
                    </Typography>
                    <Typography paragraph>
                        <ol>
                            <li>Official meetings may be hosted online.</li>
                            <li>
                                Links to all official online Activity meetings
                                must be accessible on Epsilon.
                            </li>
                            <li>
                                All official Activity meetings must be scheduled
                                on Epsilon.
                                <ul>
                                    <li>
                                        Official Activity meetings must take
                                        place between 2:30 PM and 8:00 PM.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                If an online Activity meeting faces uninvited
                                guests or inappropriate behavior, including
                                disrespectful comments, bullying, or code of
                                conduct violations, the meeting must be
                                immediately ended. Report the issue to
                                MPolazz@schools.nyc.gov and clubpub@stuysu.org.
                            </li>
                            <li>
                                Please email help@stuyactivities.org for support
                                using Epsilon and IT@stuysu.org for general
                                technical support.
                            </li>
                        </ol>
                    </Typography>
                    <Typography variant={"h5"} color="primary">
                        Meetings
                    </Typography>
                    <Typography paragraph>
                        If an Activity is found in violation of any of the rules
                        below, it will receive a strike (or suspension if
                        otherwise stated). Any combination of 3 strikes will
                        result in the revocation of the Activity’s charter (the
                        Activity must then reapply for a charter if it wishes to
                        exist). Strikes cannot be appealed. Please note that all
                        Activity meetings will be audited by an SU Auditor, who
                        will report to the directors of the SU Clubs & Pubs
                        department, and will distribute strikes accordingly.
                    </Typography>
                    <Typography>
                        <ol>
                            <li>
                                All Activities must hold meetings in an
                                appropriate manner. Any complaints made by a
                                member of the school staff or an SU Auditor in
                                regards to an Activity’s meetings can result in
                                the suspension of that Activity. This includes
                                any inappropriate behavior, fights,
                                roughhousing, racist, sexist, homophobic, or
                                otherwise disrespectful comments or statements,
                                bullying (online or in-person), and in general,
                                any violation of the rules of the Student Code
                                of Conduct or the Chancellor’s Regulations.
                            </li>
                            <li>
                                If an Activity wishes to go on trips or engage
                                in any official Activity-related meeting outside
                                of the school’s premises, they must:
                                <ul>
                                    <li>
                                        Have the registered Activity faculty
                                        advisor (not the student leaders) email
                                        clubpub@stuysu.org, the COSA (Mr.
                                        Polazzo) and the Assistant Principal
                                        (Mr. Moran) at least one week in advance
                                        with the Subject: “Activity Meeting
                                        Outside of School Premises: [ACTIVITY
                                        NAME]”. Mr. Polazzo can be reached at
                                        MPolazz@schools.nyc.gov and can be found
                                        in Room, 260. Mr. Moran can be reached
                                        at BMoran@schools.nyc.gov and can be
                                        found in Room 103.
                                    </li>
                                    <li>
                                        The email should detail the date,
                                        location, paperwork, number of people
                                        attending, Activity leader(s) and
                                        faculty leader names for the event.
                                    </li>
                                    <li>
                                        Have a faculty advisor present for the
                                        entirety of the event. Any Activity
                                        found in violation of this rule may face
                                        suspension and revocation of their
                                        charter.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                All Activities must leave the school building no
                                later than 5:00 PM or at the specified time
                                during that day unless a registered Faculty
                                Advisor for the Activity is present.
                            </li>
                            <li>
                                Activities may not use SMARTBoards in the
                                classrooms for their meetings.
                            </li>
                            <li>
                                If an Activity wishes to use the media carts
                                from the programming office, they may do so only
                                with the presence of a registered Activity
                                faculty advisor to sign them in and out.
                            </li>
                            <li>
                                Activities may not put up flyers or advertise
                                their Activity until their charter has been
                                submitted and approved. All Activities are
                                required to take down flyers from walls and/or
                                bulletin boards within a week of the event
                                having taken place.
                                <ul>
                                    <li>
                                        Fliers deemed inappropriate by SU
                                        members and school staff will be taken
                                        down without warning (i.e. Ad Hominems,
                                        Hate Speech)
                                    </li>
                                    <li>
                                        Fliers placed in and/or near escalators
                                        will be relocated or removed.
                                    </li>
                                </ul>
                            </li>
                        </ol>
                    </Typography>
                    <Typography variant={"h5"} color="primary">
                        Room Reservations and Usage
                    </Typography>
                    <Typography paragraph>
                        If an Activity is found in violation of any of the rules
                        below, it will receive a strike (or suspension if
                        otherwise stated). Any combination of 3 strikes will
                        result in the revocation of the Activity’s charter (the
                        Activity must then reapply for a charter if it wishes to
                        exist). Strikes cannot be appealed. Please note that all
                        Activity meetings will be audited by an SU Auditor, who
                        will report to the directors of the SU Clubs & Pubs
                        department, and will distribute strikes accordingly.
                    </Typography>
                    <Typography>
                        <ol>
                            <li>
                                All Activities must reserve a room on Epsilon to
                                be able to hold a meeting.
                            </li>
                            <li>
                                No Activity is entitled to a specific room. The
                                room reservation process runs on a first-come,
                                first-serve basis.
                            </li>
                            <li>
                                If an Activity needs a long-term booking of a
                                specific room, its leaders must email
                                clubpub@stuysu.org with the Subject: “Long Term
                                Room Reservation: [ACTIVITY NAME]”, detailing
                                the reason(s) for why this reservation is
                                necessary. Long term reservations will be
                                handled by the SU Clubs &amp; Pubs Department
                                and approved on a case-by-case basis.
                            </li>
                            <li>
                                All rooms used for Activity meetings must be
                                kept clean and sanitary. This means returning
                                all desks to their original positions, erasing
                                all boards, cleaning up any remaining trash,
                                etc. Any complaints made and registered by a
                                member of the school staff or an SU Auditor to
                                the SU Clubs &amp; Pubs department in regards to
                                the condition of a room may result in a strike
                                or suspension.
                            </li>
                            <li>
                                All Activities must use the room reserved for
                                their activity on the Epsilon website. Please
                                email clubpub@stuysu.org or contact an SU
                                representative if you are unable to find a room.
                            </li>
                            <li>
                                All room reservations must be canceled at least
                                24 hours in advance if the Activity can no
                                longer hold its meeting.
                            </li>
                            <li>
                                Any Activity that wishes to reserve and use
                                spaces other than school classrooms (i.e.
                                cafeteria, auditorium, lecture halls) for
                                meetings must go through the process below:
                                <ul>
                                    <li>
                                        The registered Activity faculty advisor
                                        (not the Activity leaders) must email
                                        clubpub@stuysu.org, the Student Union
                                        COSA, Mr. Polazzo, and the Assistant
                                        Principal, Mr. Moran, at least one week
                                        in advance with the Subject: “[NAME OF
                                        FACILITY] Reservation: [ACTIVITY NAME].”
                                        Mr. Polazzo can be reached at{" "}
                                        MPolazz@schools.nyc.gov and can be found
                                        in Room 260. Mr. Moran can be reached at
                                        BMoran@schools.nyc.gov and can be found
                                        in Room 103.
                                    </li>
                                    <li>
                                        The email should detail the reason for
                                        reserving the facility, as well as the
                                        date, location, number of people
                                        attending, and Activity leader names for
                                        the event.
                                    </li>
                                    <li>
                                        No Activity can invite guest speakers
                                        without approval from all entities
                                        listed above, as School Safety Agents
                                        must be notified in advance to let guest
                                        speakers into the building.
                                    </li>
                                </ul>
                            </li>
                        </ol>
                    </Typography>
                    <Typography variant={"h5"} color="primary">
                        Funding
                    </Typography>
                    <Typography>
                        <ol>
                            <li>
                                The Stuyvesant Student Union reserves the right
                                to manage funding for Activities. Activities may
                                not request money from the Student Union if the
                                money’s intended use is for:
                                <ul>
                                    <li>
                                        Unapproved trips (all trips must be
                                        approved by the administration)
                                    </li>
                                    <li>
                                        Unapproved supplies or services (Guest
                                        speakers must be approved)
                                    </li>
                                    <li>
                                        Equipment that members of the Activity
                                        intend to keep (i.e. personal items such
                                        as shirts)
                                    </li>
                                    <li>Paying faculty advisors</li>
                                    <li>
                                        Computer systems and software (see
                                        Addendum below!)
                                    </li>
                                    <li>Food or beverages</li>
                                    <li>Apparel</li>
                                </ul>
                            </li>
                            <li>
                                The Student Union will host two rounds of
                                funding: one in the Fall term, and one in the
                                Spring Term. Activities may apply for funding in
                                either or both rounds. Before each round of
                                funding, registered Activities will receive an
                                email containing the Budget Application and the
                                Budget Rules. Only Activities in need of funding
                                should fill out the application. Activities that
                                submit applications that abide by the Budget
                                Rules will be granted a meeting with the SU
                                Budget Committee, and will receive a follow-up
                                email with a designated date and time. To
                                receive funding, each Activity must have at
                                least one leader and the Faculty Advisor present
                                at its meeting with the Student Union Budget
                                Committee. Failure to attend the meeting will
                                result in an automatic refusal of the Activity’s
                                funding request. If there are extenuating
                                circumstances preventing an Activity’s leader(s)
                                or Faculty Advisor from attending the meeting,
                                an email must be sent to clubpub@stuysu.org and
                                budget@stuysu.org prior to the scheduled meeting
                                time detailing the circumstance. The Student
                                Union will decide further action based on a
                                case-by-case basis and reserves the right to
                                refuse an additional meeting if the excuse is
                                not valid.
                            </li>
                            <li>
                                When an Activity requests funding from the
                                Student Union, the Activity can request to be
                                given money in the form of a grant&nbsp;or a
                                loan.
                                <ul>
                                    <li>
                                        Grant:&nbsp;Upon receiving a grant, the
                                        Activity must spend its own money before
                                        receiving reimbursements from the
                                        Student Union up to the amount allocated
                                        (not including tax). Activities must
                                        save all of their receipts and submit
                                        original copies to the SU Budget
                                        Department (budget@stuysu.org ). Two
                                        weeks after submission, the Activity
                                        should go to Room 103 to pick up the
                                        reimbursement check from Ms. Caruzo (the
                                        school treasurer). The Budget Department
                                        cannot reimburse taxes, so it is
                                        suggested that the Activity use the
                                        school’s tax-exempt form. If granted
                                        money by the SU, the Budget Department
                                        will email the Activity leaders the
                                        tax-exempt form.
                                    </li>
                                    <li>
                                        Loan:&nbsp;Upon receiving a loan, the
                                        Activity has until the end of the
                                        current school year to repay the Student
                                        Union, unless otherwise specified.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                The Student Union reserves the right to ensure
                                that the funds given to Activities have been
                                spent appropriately, and in order to do so, the
                                Student Union will audit each Activity that
                                receives funding. By accepting funding from the
                                SU, all Activities are subject to the following
                                rules:
                                <ul>
                                    <li>
                                        Activity leaders&nbsp;are expected to
                                        cooperate with the SU Budget Department.
                                    </li>
                                    <li>
                                        If an Activity has received a grant, it
                                        must provide proof of purchase of each
                                        item (in the form of a receipt) as well
                                        as information on the purchase (i.e.
                                        expected delivery date) to the Budget
                                        Department (budget@stuysu.org) within
                                        seven days of purchase.
                                    </li>
                                    <li>
                                        Any items purchased must be shown at the
                                        advanced request of the Budget
                                        Department.
                                    </li>
                                    <li>
                                        All items purchased by Activities will
                                        be returned to the Student Union at the
                                        end of the school year. These will be
                                        kept in storage until the following
                                        school year, at which point, if the
                                        Activity still exists, they will return
                                        to the Activity’s possession. If not,
                                        the Student Union will assume possession
                                        of the items.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Activities found in violation of the
                                aforementioned rules will receive a warning from
                                the Budget Department via email. If the offense
                                is severe enough, a warning is not required for
                                action to be taken against the Activity. If the
                                Activity is found to have committed a second
                                violation, the Budget Department reserves the
                                right to rescind the Activity’s funding for the
                                remainder of the school year and suspend the
                                Activity.
                            </li>
                            <li>
                                Any Activity that uses money received from the
                                SU in any way other than what it was originally
                                approved for will be immediately suspended and
                                will have its charter revoked.
                            </li>
                            <li>
                                The Funding Rules are subject to change and the
                                Student Union reserves the right to amend them
                                through a majority vote of the Budget Committee.
                            </li>
                        </ol>

                        <ul>
                            <li>
                                A Faculty Advisor must be present if:
                                <ul>
                                    {" "}
                                    <li>
                                        An Activity plans to host speakers and
                                        lectures in the cafeteria, library,
                                        lecture halls, or auditoriums.
                                    </li>
                                    <li>
                                        An Activity plans to host events,
                                        meetings, field trips, etc outside of
                                        Stuyvesant with Activity members
                                        present. This does not include virtual
                                        meetings.
                                    </li>
                                    <li>
                                        An Activity plans to host meetings in
                                        Stuyvesant past 5:00 PM.
                                    </li>
                                    <li>
                                        An Activity plans to request funding
                                        from the Student Union.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                If an Activity wishes to spend the money they
                                have received during the Club Pub Allocations
                                Process, the faculty advisor must sign under the
                                “Advisor/COSA” field on the Reimbursement Form.
                                This will indicate that the purchase has been
                                approved by the faculty advisor.
                            </li>
                            <li>
                                If an Activity has received any combination of 3
                                strikes, they may resubmit a charter after their
                                suspension. If approved, a faculty advisor must
                                be present at all meetings until otherwise
                                specified by the Student Union.
                            </li>
                        </ul>
                    </Typography>
                    <Typography variant={"h5"} color="primary">
                        Fundraising
                    </Typography>
                    <Typography>
                        <ul>
                            <li>
                                <b>
                                    Please view the full list of fundraising
                                    guidelines{" "}
                                </b>{" "}
                                <Link
                                    color="primary"
                                    href="https://docs.google.com/document/d/10RD4PIHYYiHTLBMGyKlfOlHU60kzJ8l7PTl4jHjFOmQ/edit?usp=sharing"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <b>here</b>
                                </Link>{" "}
                                <b>and the Staff Treasury Memo</b>{" "}
                                <Link
                                    color="primary"
                                    href="https://docs.google.com/document/d/1iXmJKKf6PvroDvOQSekMJFwnokJHgCApGqKx4uNYfM0/edit?usp=sharing"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <b>here</b>
                                </Link>{" "}
                                <b>before pursuing any fundraising endeavors</b>
                            </li>
                            <li>
                                Purchases and Reimbursements:
                                <ul>
                                    <li>
                                        All equipment, supplies, and services
                                        purchases should be made through FAMIS
                                        and ShopDOE as per NYC DOE Standard
                                        Operating Procedures (SOP). Only certain
                                        purchases may use General School Funds
                                        (GSF) with prior written approval from
                                        the Business Manager, APO, and
                                        Principal.
                                    </li>
                                    <li>
                                        Personal funds should not be used for
                                        school purchases without prior written
                                        approval. Reimbursements for such
                                        purchases are not allowed unless
                                        pre-approved in writing. No tax will be
                                        reimbursed; use the Tax-Exempt
                                        Certificate available in Room 105.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Expenditure Requests:
                                <ul>
                                    <li>
                                        Expenditure requests must use the
                                        "Request for Expenditure" form (fillable
                                        PDFs linked online or available in Room
                                        105). Requests must include invoices
                                        (not statements, quotes, or estimates)
                                        and be submitted within two weeks of
                                        delivery or payment.
                                    </li>
                                    <li>
                                        Expenditure requests related to
                                        meetings, events, trips, or merchandise
                                        require additional documentation such as
                                        meeting agendas, signed attendance
                                        sheets, trip approval forms, and packing
                                        slips signed by the receiver.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Deposit Procedures:
                                <ul>
                                    <li>
                                        Deposits are handled only by Dina Ingram
                                        in Room 105 or 273C (Tuesdays and
                                        Thursdays). Cash and checks should be
                                        separated by denomination, and checks
                                        must be made out to Stuyvesant High
                                        School, including the student's name and
                                        OSIS in the memo.
                                    </li>
                                    <li>
                                        The "Authorization to Collect General
                                        School Funds" form must be completed
                                        before any funds are collected, and no
                                        student is allowed to collect funds.
                                        Faculty advisors or another designated
                                        staff must supervise fundraising
                                        activities.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Fundraising Rules:
                                <ul>
                                    <li>
                                        All fundraising activities require prior
                                        approval using the "Authorization to
                                        Collect General School Funds" form,
                                        signed and submitted by the faculty
                                        advisor or coach. No students are
                                        allowed to handle or collect funds
                                        directly.
                                    </li>
                                    <li>
                                        Each fundraising event must have a
                                        "Final Statement at Conclusion of
                                        Revenue Producing Activity" form,
                                        listing all items sold, prices, and
                                        persons sold to, noting any profit or
                                        loss.
                                    </li>
                                </ul>
                            </li>
                            <li>
                                Handling of Funds:
                                <ul>
                                    <li>
                                        All funds should be deposited
                                        immediately after an event or no later
                                        than three days after. Funds must not be
                                        stored with students or off school
                                        grounds.
                                    </li>
                                    <li>
                                        Only cash and checks are accepted for
                                        deposits; electronic payments are not
                                        accepted unless through the school
                                        website for larger collections.
                                    </li>
                                </ul>
                            </li>
                            <li>General Notes:</li>
                            <ul>
                                <li>
                                    All forms and documents related to financial
                                    transactions are available in Room 105.
                                </li>
                                <li>
                                    Checks for expenditures and deposits will be
                                    processed twice weekly (Tuesdays and
                                    Thursdays).
                                </li>
                            </ul>
                        </ul>
                    </Typography>
                    <br />
                    <Typography paragraph>
                        ANY ACTIVITY THAT FAILS TO AGREE WITH THE ABOVE SET OF
                        RULES WILL NOT BE CHARTERED. THE STUYVESANT STUDENT
                        UNION RESERVES THE RIGHT TO SUSPEND ANY ACTIVITY THAT
                        DOES NOT FOLLOW THESE RULES WITHOUT ANY PRIOR NOTICE.
                    </Typography>
                </div>
            </div>
        </Box>
    );
};

export default Rules;
