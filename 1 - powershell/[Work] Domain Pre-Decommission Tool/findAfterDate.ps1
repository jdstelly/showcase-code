# Declare discrepancies array to hold files that we find have been written to after the target date.
$discrepancies = @()

# Prompt the user for the target date, store in variable.
$targetDate = Read-Host ('Please enter the target date and time (Example: 02/10/2020 14:30)')

# Convert that target date to Epoch time.
$targetDate = [Math]::Floor([decimal](Get-Date(Get-Date $targetDate).ToUniversalTime()-uformat "%s"))

# Prompt the user for the target directory, store in variable.
$targetPath = Read-Host "Please enter the target directory (Example: 'C:\')"

# For each item returned by a recursive, silent directory search from the root of 'targetPath'..
foreach ($item in dir -Path $targetPath -Recurse -ErrorAction SilentlyContinue) 
    {
        # ..if the epoch time of that item's LastWriteTime Object Member is greater (later) than the Epoch Time of targetDate..
        if ([Math]::Floor([decimal](Get-Date($item.LastWriteTime).ToUniversalTime()-uformat "%s")) -gt $targetDate)
            {
                # ..then append that item's 'FullName' and 'LastWriteTime' to the 'discrepancies' array.
                $discrepancies += $item.FullName, $item.LastWriteTime
            }
    }

# Output to terminal for review.
echo $discrepancies
