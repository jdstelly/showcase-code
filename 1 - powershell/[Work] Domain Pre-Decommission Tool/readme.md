'findAfterDate.ps1' is a small, simple tool I wrote to assist me in supporting domain migrations. 

If both the source and destination domain servers are simultaneously online, there is a good chance that users will find a way to save new files to the old server prior to its decommission.
As a Jr. System Admin, it was my duty to minimize user suffering caused by domain migrations. This tool will find every file that was updated after a specified date and return a list of locations and times.
I would run this prior to decommissioning an old domain server. It was useful. I can honestly say that I've saved a client of my previous employer a few lost documents with this script.