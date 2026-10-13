# Business & Domain Context
## ShopDeck, My Role, My Workflow, and the Environment This Project Operates In

### Introduction

This document is intended to provide complete business context for every project built for me. It is not a product specification and it should not be interpreted as one. Instead, it explains the environment I work in, the company I work for, the responsibilities I have, the problems I solve every day, and the way I think about those problems.

Any application, automation, dashboard, AI agent, or workflow built for me should first understand this context before making design decisions. Without this understanding, it is very easy to build software that looks useful but fails to solve the actual problems I face.

My work is highly analytical and revolves around improving the profitability of hundreds of small direct-to-consumer businesses. Every decision I make is driven by business economics rather than individual metrics. The software built for me should therefore think in terms of business outcomes rather than simply displaying data.

---

# About Me

My name is Yash Desai, and I work as a Growth Manager at ShopDeck. This is my first full-time corporate role after completing my MBA, and I currently manage approximately 150–200 seller accounts through a team of Growth Consultants.

Two Growth Consultants currently report to me:

- Vikas Tribhuwan Pandey
- Divyanshi Panjikar

Each consultant independently manages approximately forty to forty-five seller accounts. While they execute most day-to-day operational work, I am responsible for the overall performance of every seller under my team.

My work sits somewhere between analytics, consulting, operations, marketing, and people management. I am expected to identify why sellers are not profitable, create strategies that improve their performance, guide my consultants on implementation, monitor progress every day, and report overall business health to senior management.

Unlike many managerial roles where work primarily involves meetings and delegation, my role is heavily data driven. I spend a large portion of every day reading reports, comparing metrics, identifying patterns, diagnosing business problems, and deciding which actions will create the largest improvement in profitability.

---

# Understanding ShopDeck

To understand my work, it is first necessary to understand how ShopDeck operates.

ShopDeck is a Direct-to-Consumer enablement platform. Instead of helping sellers operate on marketplaces such as Amazon or Flipkart, ShopDeck enables businesses to build and grow their own independent online brands.

Most sellers joining ShopDeck are manufacturers, wholesalers, traders, or small business owners who have products but lack expertise in digital commerce. ShopDeck provides them with almost everything required to sell directly to customers.

This includes website infrastructure, Meta advertising, logistics integration, payment gateway integration, technology, operational support, catalog management, and growth consulting.

The objective is to allow sellers to focus primarily on sourcing products while ShopDeck handles the complexities of acquiring customers and fulfilling orders.

Unlike a traditional marketing agency, ShopDeck's incentives are closely aligned with the seller's success.

ShopDeck does not simply charge a monthly consulting fee regardless of outcomes.

Instead, ShopDeck primarily earns when sellers successfully deliver orders.

This creates a fundamentally different business model.

If sellers fail, ShopDeck earns very little.

If sellers become profitable and scale successfully, ShopDeck scales alongside them.

Every project built for me should understand this alignment because it influences almost every decision made inside the company.

---

# Why Profitability Matters More Than Growth

Many e-commerce companies optimise primarily for revenue growth.

ShopDeck does not.

Revenue without profitability creates unsustainable businesses.

If sellers continuously lose money, they eventually stop advertising, reduce inventory, or leave the platform entirely.

For this reason, profitability is considered the single most important measure of account health.

Increasing sales is valuable only if those sales create profitable growth.

This philosophy should guide every recommendation produced by any software built for me.

Whenever two possible recommendations exist, the system should favour the one that improves sustainable profitability rather than superficial growth metrics.

---

# The Seller Lifecycle

Every seller follows a fairly standardized journey inside ShopDeck.

A seller first joins the platform during onboarding. During this phase the website is created, products are uploaded, logistics are configured, payment systems are integrated, and advertising assets are prepared.

Once everything is ready, ownership transfers to the HITS department.

This is where I work.

At this point advertising begins and the seller officially becomes "live."

The seller remains inside HITS until profitability reaches a predefined threshold.

Once the account consistently demonstrates healthy economics, ownership transfers to the Revenue team, whose responsibility shifts from fixing the business to scaling it aggressively.

The transition from HITS to Revenue is one of the most important milestones inside the company because it represents the difference between a fragile business and a scalable one.

---

# The HITS Department

The HITS department exists for one purpose:

Turn newly launched sellers into profitable businesses.

Every seller entering HITS has uncertainty.

Some have poor products.

Some have poor pricing.

Some suffer from logistics issues.

Others struggle because of advertising inefficiency.

Many have multiple problems simultaneously.

The responsibility of HITS is to identify these problems quickly, solve them, and create a business capable of scaling.

Every recommendation made by any application should ultimately answer one question:

**"What is preventing this seller from graduating from HITS?"**

---

# What Makes a Seller a HIT

A seller does not become a HIT simply because profit is positive.

The qualification rules are intentionally strict.

A seller must achieve more than 5% net profit for two consecutive weeks.

During both weeks the seller must spend at least ₹3,500 on marketing.

In addition, the seller must maintain a Product Quality score above 2.8.

The requirement for consecutive profitable weeks exists because isolated profitability can occur due to randomness or unusually low advertising spend. Consistency demonstrates that the business model is genuinely working.

The marketing spend threshold ensures profitability is achieved while actively acquiring customers rather than by simply reducing advertising.

The Product Quality threshold ensures that profitability is not being generated through poor customer experience or misleading products.

These business rules are extremely important because they influence priorities throughout my work.

---

# My Responsibilities

Although my title is Growth Manager, my work extends far beyond managing people.

Every day I am expected to understand the health of approximately two hundred businesses.

I identify which sellers require immediate intervention, which consultants need support, which accounts are improving, which accounts are deteriorating, and which accounts are close to achieving HIT status.

I also review advertising performance, examine profitability reports, analyse operational bottlenecks, identify geographical issues, discuss strategies with consultants, coordinate with internal teams, and communicate performance upward to management.

My decisions directly influence how advertising budgets are spent, how consultant time is allocated, and ultimately how quickly sellers become profitable.

---

# The Nature of My Work

Most people assume my work revolves around Meta advertising.

It does not.

Advertising is only one component of a much larger system.

Every seller is influenced simultaneously by pricing, logistics, payment methods, customer behaviour, product quality, inventory availability, geographic demand, advertising efficiency, and operational execution.

My responsibility is understanding how all these variables interact.

This makes my work fundamentally diagnostic rather than operational.

I spend much more time asking "why" than performing repetitive tasks.

---

# Business Economics

The most important concept anyone building software for me should understand is that profitability is produced by a chain of interconnected variables.

Revenue alone means very little.

A seller can generate high sales while losing money.

Likewise, a seller with relatively modest revenue can be highly profitable if the underlying economics are healthy.

Every seller's profitability is influenced by advertising costs, logistics expenses, cost of goods sold, delivery success rate, payment method distribution, average order value, cancellations, and product mix.

None of these variables should ever be interpreted independently.

Their relationships matter far more than their individual values.

---

# Why RTO Is So Important

One of the most significant concepts inside ShopDeck is Return to Origin, commonly abbreviated as RTO.

An RTO occurs when an order is shipped but never reaches the customer.

The package travels from the warehouse toward the customer and is then returned to the seller.

Unlike a cancellation, substantial costs have already been incurred before the order fails.

Advertising money has already been spent to acquire the customer.

Forward logistics has already been paid.

Reverse logistics must now also be paid.

No revenue is generated.

This makes RTO one of the most destructive events in the entire business model.

Whenever RTO becomes high, profitability deteriorates rapidly.

Because of this, RTO is often one of the first areas investigated during seller troubleshooting.

---

# Cash on Delivery

Most Indian D2C sellers receive the majority of their orders through Cash on Delivery.

While COD generally improves conversion rates, it also increases delivery risk.

Customers who have not prepaid have little financial commitment to accepting the shipment.

This frequently results in higher refusal rates, fake orders, unreachable customers, or changed purchasing decisions.

Consequently, COD percentage and RTO percentage are closely linked.

Whenever a seller has extremely high COD concentration combined with high RTO, it usually represents a structural business problem rather than simply an advertising issue.

---

# How I Think

One of the most important characteristics of my work is that I do not think in terms of metrics.

I think in terms of causality.

Whenever I receive data, I am not interested in knowing that a metric is high or low.

I want to understand why.

For example, if profit is negative, profit itself is not the problem.

Negative profit is merely evidence that something else is wrong.

The actual problem may be excessive advertising costs.

It may be poor logistics.

It may be low pricing.

It may be high COD concentration.

It may be poor products.

It may be advertising the wrong products.

It may be poor geographical targeting.

It may be several factors simultaneously.

The challenge is identifying which factor contributes the largest share of the problem.

Every application built for me should reason in this same manner.

---

# My Decision-Making Philosophy

Whenever multiple issues exist, they should never be treated equally.

The software should always identify the dominant bottleneck.

Once that bottleneck is understood, secondary issues can be ranked according to expected business impact.

Simply presenting ten observations provides very little value.

The software should instead explain the business story behind the numbers.

It should tell me what happened, why it happened, what should be done first, and how much improvement I should expect if that recommendation is implemented.

---

# Data I Work With

Almost every decision I make is supported by data exported from internal systems.

The weekly Profit and Loss report provides the overall financial picture of each seller.

Campaign-level reports explain how individual advertising campaigns contribute to profitability.

State-level reports identify geographic strengths and weaknesses.

Payment mode reports explain how customer payment behaviour affects delivery success.

Meta Ads reports reveal how advertising performs across campaigns, ad sets, and creatives.

Product catalogues explain pricing, inventory, and margins.

SKU-level profitability reports identify which products deserve more advertising investment.

No single report contains the complete answer.

The value comes from combining multiple reports into one coherent diagnosis.

---

# Existing Systems

Today, my work is spread across numerous disconnected systems.

Google Sheets is used for internal operational tracking.

Metabase provides business reporting.

Meta Ads Manager provides campaign data.

Internal dashboards track seller progress.

Communication happens through WhatsApp, Slack, and meetings.

This fragmentation creates enormous operational overhead.

A significant portion of my work involves moving between systems rather than making decisions.

---

# The Biggest Problems I Face

The largest challenge in my work is not the absence of data.

It is the abundance of disconnected information.

Almost every important decision requires opening multiple reports, manually comparing numbers, calculating relationships, identifying trends, and translating those findings into actions.

This process is repetitive, time consuming, and mentally exhausting.

Much of the work follows similar reasoning patterns, yet it must currently be repeated manually for every seller every week.

Any software built for me should primarily aim to reduce this cognitive workload.

---

# Terminology Used Inside ShopDeck

Several business terms are used frequently and should always be understood consistently.

A seller is **Assigned** when ownership has been allocated to a Growth Consultant.

A seller becomes **Live** once advertising begins.

A seller is considered **Spending** on any day advertisements are actively running.

If advertisements stop running, the seller becomes **Paused**.

A **Potential** seller has completed one qualifying profitable week and is waiting for the second.

A **HIT** has successfully satisfied every business requirement and is ready for transfer to the Revenue team.

---

# Guiding Principle

Every project built for me should remember one simple idea.

I am not trying to build software that stores information.

I am trying to build software that understands my business.

The value of any application is not determined by the number of charts it displays or the amount of data it stores.

Its value is determined by how effectively it reduces decision-making effort, identifies opportunities before I notice them, explains complex business situations clearly, and helps me make better decisions faster.