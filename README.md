## Code and data repo for mapping definitions of hierarchy in the social sciences

This repo contains all the code and data used in study 1 of my dissertation, a computer-aided systematic quantitative literature review (caSQLR) of how hierarchy is defined in the social sciences.

Beware: If you're looking to use this process for your own work, it's doable, but it will require a lot of time, effort, and manual work despite having scripts to automate many of the processes. A number of the issues result from having to work against Google Scholar's combination of defenses against automated querying and lack of complete and useful information in its initial results (e.g., truncating author and journal title fields). Google Scholar has full-text indexing, so it's the only game in town. 

The overall approach I use here should be something any researcher can do easily and routinely, rather than engaging in all these workarounds and fiddlings and because we don't have proper control of, and access to, our body of knowledge. We, as scientists, need to step up and take control of open science, literature, and infrastructure. 

## Procedure overview:

I use Scraper API with Scholarly to query and scrape Google Scholar (GSc), turn the resulting JSON into bibtext files, important those into Zotero, tag them by which definitional search term they came from, request PDFs via Zotero's built-in tool (excluding all items that don't have full-text from further processing), use some javascript to extract metadata and definitional snippets from Zotero for each item, and then make a CSV with all that data. I then open all ~1k links from the metadata in Chrome and add them all to Zotero manually, then do some cleanup and merge the data so I have journal titles for the items that have them (some are dissertations or working papers). Below I go into this process in more detail.

## The main scripts

These are pretty much named after what they do:
- scraper_query_to_json.ipynb queries the Scraper API proxy and writes the results to JSON
- bib_maker.ipynb makes the bib files to import into Zotero.
- snippet_extractor.ipynb extracts snippets from the json that is created using zotero_json_fulltext.js run in Zotero.
- zotero_json_fulltext.js must be run in Zotero's javascript execution window, not by itself.

## Procedure detailed

1. Scraper API is used, with Scholarly, to get the results from Google Scholar. Those results are written to JSON files with filenames that include the number of results Google Scholar claimed it would get. This is unfortunate, because this number is almost always wrong. So the number of results rarely matches, although is always in the ballpark, of the datafile name. The file for this is scraper_query_to_json.ipynb

NOTE: Scholarly does not get the full journal title name. Doing so requires Scholarly to open the "Cite" popup to get the full info, and that takes a lot of credits in Scraper API. Doing it for the large initial set is a waste of resources, because many of them will not have full text available. If one were to go through and steamline the process, full citation information should be retrieved for all items that Zotero finds full text data for. This would require exporting data from Zotero for those items and then matching them up with Scholarly results. It was enough of a headache I skipped trying to automate that part. In this study, later in the workflow, once the items have been winnowed down, I get the journal titles manually. Ensuring full data is retrieved would be a HUGE win for saving time with Scholarly, if we could identify which items have full text available.

2. bib_maker reads the JSON files and makes bib files to import into Zotero. The file for this is bib_maker.ipynb

3. Using Zotero's import option, we import every bib file into its own folder in Zotero, under a main folder for the project. 

NOTE: Zotero's folders don't match the metaphor of a file folder. It's like Zotero's quickstart says, "Think of collections like playlists in a music player: items in collections are aliases (or "links") to a single copy of the item in your library. The same item can belong to many collections at one time."

4. After Zotero has all the items, each bib being its own directory, the items are tagged with the search that led to them. This allows us to know why there are dupes, among other things, because an item in multiple folders will have multiple tags: one from each folder. Use the Zotero tag manager plugin https://github.com/windingwind/zotero-tag to make the tagging process much easier. Unfortunately, since the bib files have only ballpark numbers, so too do the directories of items. They don't match the actual number of items. I would do this differently if I were to repeat this process; I didn't realize how inaccurate Google Scholar's item counts would be.

5. Once everything is tagged, all the PDFs are requested via Zotero's Request PDF option. Despite being automated, it's a long and tedious process because it will hang from sites not responding. The Zotero developers may have fixed some of these hanging issues after I reported them.

6. Those items with PDFs are then put into a new directory so we have them all together. Items in Zotero can be sorted by presence of PDF / attachment, making this fairly easy.

7. The code in zotero_json_fulltext.js is then pasted into Zotero's javascript window and run. This Zotero option is accessible Tools > Developer > Run javascript. This outputs yet more JSON, this time in little chunks of 250. These chunks are a single line of text, but include 250 items, with some metadata, and the full text.

8. We then extract snippets using snippet_extractor.ipynb. A python JSON/CSV parser that, item by item:
	- extracts the full-text
	- identifies and counts the number of definitional phrases in the full-text
	- identifies the surrounding (pre, post, and including) sentences for each (the definitonal snippet)
	- if only one phrase, writes the definitional snippet to that entry
	- if more than one phrase, creates a new entry for every occurrence above 1.

Thus, we can have more snippets than we have items from Zotero, which is totally ok, but something to remember.

The final step, getting journal titles, is detailed below.

### The items and the issue with journal titles

None of the original items in the imported bibtex Zotero folders have the journal title. If we work backwards, we know that the bibtex files not having the journal titles means that the entires retrieved through Scholarly didn't have the journal titles, because the bibtext came from Scholarly. I wasn't going to spend the money (grad student here!) or hit Google Scholar with queries to get the full metadata for thousands of items that wouldn't make it through the screening process. But more importantly for this particular study, this raises the question of where journal titles came from to assign Scopus categories to. Unfortunately, I did it by hand. Here is the process; it's not as bad as it sounds to do this manually.

1. First, make a separate Zotero collection for this.
2. Programmatically create duckduckgo searches using item titles (this can be done in Notepad++)
3. Strip all punctuation and replacing spaces with + symbols
4. Paste all of them in Excel col B
5. In col A use the HYPERLINK=B1 function to make these clickable in excel
6. Open however many tabs your browser can handle (in my case, ~500 tabs) and then in each of them, go to the obvious page.
7. Use the browser Zotero button on each of the pages to add it to a folder.
8. You can then export a CSV from Zotero that has the journal titles matched with item titles.

NOTE: In Zotero this is a separate folder from the main ch1 CASQLR folder so the two sets of citations don't get mixed: "ch1 metadata by hand" This folder contains 988 items total.

This was then loaded from "./data_for_reading/ch1 metadata by hand_v03.csv" as meta_df (my variable name for the dataframe) back upstream in the process, and then joined with the other data a little later. A few had titles that had a character or word off, and they were also fixed in the analysis code, but with a bit of help from manual investigation.

The fix? First, how I merged them: I formatted titles to be long character strings without spaces or punctuation in both the original, titleless set and the metadata by hand set so that I could merge them together. A few of these were slightly messed up, so I used a "./data_for_reading/messy_rosetta_v03.csv" to match and map (thus, rosetta) the equivalents so I could properly merge everything. This CSV resulted from me investigating the 60 or so titles with minor inconsistencies. For example, one title might have "familia" in it, but the merging title had "famlia", with the missing "i" preventing the merge because the strings didn't match exactly. The fixes for almost all of these were very obvious. There were only 3 of these 988 items that were shown to need excluding because of GSc picking up something truly odd; they were targeted exclusions in the analysis Rmd file. (Remember, because an item may have more than one definition within it, there are more definitional snippets than items, but not a lot more.)

### Using sjrdata with the journal titles to label some articles with field categories

The sjrdata library enables us to get a bunch of information for journals, but we only care about field categories for this particular study. Journals may change field categories one year to another, but these shifts are not of any important, and we should ignore this date information. Thus, I took the field category data for all years for a particular journal, put it all together, removed all duplicate categories, and thus had all distinct categories ever assigned to that journal. Then I joined that dataframe of journal titles and categories with the item data I had with journal titles.

## Tagging definitions and establishing a codebook for the tagging

The codebook is a random sample of 30 of the ~1k or so definitions (sampled and generated in the result_ch1_hier_casqlr RMD file). The resulting sample was a pretty good mix of dimensions of hierarchy and the types of snippets to be found in the whole dataset, providing good coverage of how different tags would be applied to snippets. 

