#!/usr/bin/env python3
import json
import sys
import unicodedata
import musicbrainzngs
import re
musicbrainzngs.set_useragent("One-Hit-Quiz Track Retrieval", "1.0.0", "github.com/strangebroadcasts/one-hit-quiz")

artist_id = input("Enter MusicBrainz artist ID (in hex format, e.g. bcadd123-...): ")
if len(artist_id.strip()) < 1:
    print("Exiting.")
    sys.exit(0)
titles = []
limit, offset = 25, 0
recording_count = 10000
while offset <= recording_count:
    result = musicbrainzngs.browse_recordings(artist=artist_id, limit=limit, offset=offset)
    recording_list = result.get('recording-list', [])
    recording_count = result.get('recording-count', 0)
    titles += [record['title'] for record in recording_list]
    offset += limit

sorted_titles = sorted(list(set([unicodedata.normalize('NFC', title) for title in titles])))

print(sorted_titles)

titles_without_suffixes = sorted(list(set([re.sub(r'\ ?\(.*\)$', '', title) for title in sorted_titles])))
print(titles_without_suffixes)

questions = {re.sub(r'[^\w]', '', title.lower()): title for title in titles_without_suffixes}
with open('titles.json', 'w') as title_file:
    json.dump(questions, title_file)