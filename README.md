# Overview

This solution listens to events from Twilio Segment and writes data to a
Teradata Vantage instance. The example uses GCP but it can be translated
into any cloud platform.

# Architecture

In this solution, Twilio Segment writes raw event data to GCP Pub/Sub.
Pub/Sub forwards events to a Cloud Run application. The Cloud Run app
writes data to a Teradata Vantage database. It’s a serverless solution
that doesn’t require allocation or management of any VM’s.

![image](https://user-images.githubusercontent.com/6579240/154106062-e144ce26-147e-450d-aa68-b2f0848fe15d.png)

# Prerequsites

1.  A GCP account. If you don’t have an account, you can create one at
    <https://console.cloud.google.com/>.

2.  `gcloud` installed. See <https://cloud.google.com/sdk/docs/install>.

3.  A Vantage Express instance that GCP Cloud run can talk to. The
    easiest way to start on your own is to run a [Vantage Express
    instance in GCP](https://quickstarts.teradata.com/current/vantage.express.gcp.html).

# Deployment

For deployment instructions see https://quickstarts.teradata.com/current/segment.html.
